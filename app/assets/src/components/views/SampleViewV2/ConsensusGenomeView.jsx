import { filter, head, isEmpty } from "lodash/fp";
import React from "react";
import memoize from "memoize-one";
import cx from "classnames";

import { getWorkflowRunResults } from "~/api";
import { logAnalyticsEvent } from "~/api/analytics";
import BasicPopup from "~/components/BasicPopup";
import NarrowContainer from "~/components/layout/NarrowContainer";
import { WORKFLOWS } from "~/components/utils/workflows";
import { formatPercent } from "~/components/utils/format";
import { getTooltipStyle } from "~/components/utils/tooltip";
import { getConsensusGenomeZipLink } from "~/components/views/report/utils/download";
import SampleMessage from "~/components/views/SampleViewV2/SampleMessage";
import Histogram from "~/components/visualizations/Histogram";
import { HelpIcon, TooltipVizTable } from "~ui/containers";
import { Table } from "~/components/visualizations/table";
import DownloadButton from "~ui/controls/buttons/DownloadButton";
import SecondaryButton from "~ui/controls/buttons/SecondaryButton";
import ExternalLink from "~ui/controls/ExternalLink";
import { IconAlert, LoadingIcon, IconArrowRight } from "~ui/icons";
import { CONSENSUS_GENOME_DOC_LINK } from "~utils/documentationLinks";
import { openUrl, openUrlInNewTab } from "~utils/links";
import PropTypes from "~utils/propTypes";
import { sampleErrorInfo } from "~utils/sample";

import cs from "./consensus_genome_view.scss";
import csSampleMessage from "./sample_message.scss";

const CONSENSUS_GENOME_VIEW_METRIC_COLUMNS = [
  [
    {
      key: "referenceNCBIEntry",
      name: "Reference NCBI Entry",
      tooltip: "The NCBI Genbank entry for the reference accession.",
    },
  ],
  [
    {
      key: "referenceLength",
      name: "Reference Length",
      tooltip: "Length in base pairs of the reference accession.",
    },
  ],
  [
    {
      key: "coverageDepth",
      name: "Coverage Depth",
      tooltip:
        "The average read depth of aligned contigs and reads over the length of the accession.",
    },
  ],
  [
    {
      key: "coverageBreadth",
      name: "Coverage Breadth",
      tooltip:
        "The percentage of the accession that is covered by at least one read or contig.",
    },
  ],
];

// TODO: use classnames and css
const FILL_COLOR = "#A9BDFC";
const HOVER_FILL_COLOR = "#3867FA";

class ConsensusGenomeView extends React.Component {
  constructor(props) {
    super(props);

    this.workflow =
      head(
        filter(
          { workflow: WORKFLOWS.CONSENSUS_GENOME.value },
          this.props.sample.workflow_runs
        )
      ) || {};

    this.state = {
      data: null,
      histogramTooltipData: null,
      histogramTooltipLocation: null,
    };
  }

  componentDidMount = async () => {
    const data = await getWorkflowRunResults(this.workflow.id);
    this.setState({ data });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const { data } = this.state;
    if (data && data.coverage_viz && data !== prevState.data) {
      this.renderHistogram();
    }
  };

  renderResults() {
    const { sample } = this.props;
    const { data, histogramTooltipData, histogramTooltipLocation } = this.state;

    const helpText = (
      <React.Fragment>
        These metrics and chart help determine the coverage of the reference
        genome.
        <ExternalLink
          href={CONSENSUS_GENOME_DOC_LINK}
          onClick={() =>
            logAnalyticsEvent("ConsensusGenomeView_help-link_clicked")
          }
        >
          Learn more.
        </ExternalLink>
      </React.Fragment>
    );
    return (
      <React.Fragment>
        <div className={cs.resultsContainer}>
          <div className={cs.learnMoreContainer}>
            <ExternalLink
              className={cs.learnMoreLink}
              href={CONSENSUS_GENOME_DOC_LINK}
              onClick={() =>
                logAnalyticsEvent("ConsensusGenomeView_learn-more-link_clicked")
              }
            >
              Learn more about consensus genomes <IconArrowRight />
            </ExternalLink>
          </div>
          {data && !isEmpty(data.quality_metrics) && this.renderMetricsTable()}
          <div className={cs.section}>
            <div className={cs.header}>Download Consensus Genome Results</div>
            <div className={cs.body}>
              These are your consensus genome result files. You can download
              them all in a .zip file.
            </div>
            <div className={cs.subheader}>This is what you'll get:</div>
            <div className={cs.offsetBody}>
              {/* TODO: Migrate to come from an output file listing what went into the ZIP. */}
              <div className={cs.emphasis}>consensus.fa</div>
              <div className={cs.emphasis}>depths.png</div>
              <div className={cs.emphasis}>report.tsv</div>
              <div className={cs.emphasis}>report.txt</div>
              <div>aligned_reads.bam</div>
              <div>ercc_stats.txt</div>
              <div>no_host_1.fq.gz</div>
              <div>no_host_2.fq.gz</div>
              <div>primertrimmed.bam.bai</div>
              <div>primertrimmed.bam</div>
              <div>stats.json</div>
              <div>variants.vcf.gz</div>
            </div>
            <div>
              <DownloadButton
                text="Download All"
                onClick={() => {
                  openUrl(getConsensusGenomeZipLink(sample.id));
                  logAnalyticsEvent(
                    "ConsensusGenomeView_download-all-button_clicked",
                    {
                      sampleId: sample.id,
                    }
                  );
                }}
              />
            </div>
          </div>
          <div className={cs.section}>
            <div className={cs.header}>
              Learn more about Consensus Genomes in our Help Center
            </div>
            <div className={cs.body}>
              We'll show you how to analyze your samples, how our pipeline
              works, and how to upload them to public repositories.
            </div>
            <div>
              <SecondaryButton
                onClick={() => {
                  openUrlInNewTab(CONSENSUS_GENOME_DOC_LINK);
                  logAnalyticsEvent(
                    "ConsensusGenomeView_view-help-docs-button_clicked"
                  );
                }}
                text="View Help Docs"
              />
            </div>
          </div>
          {data && data.coverage_viz && (
            <div className={cs.section}>
              <div className={cs.header}>
                How good is the coverage?
                <HelpIcon text={helpText} className={cs.helpIcon} />
              </div>
              <div>{this.renderCoverage()}</div>
            </div>
          )}
        </div>
        {histogramTooltipLocation && histogramTooltipData && (
          <div
            style={getTooltipStyle(histogramTooltipLocation)}
            className={cs.hoverTooltip}
          >
            <TooltipVizTable data={histogramTooltipData} />
          </div>
        )}
      </React.Fragment>
    );
  }

  getHistogramTooltipData = memoize((accessionData, coverageIndex) => {
    // coverageObj format:
    //   [binIndex, averageCoverageDepth, coverageBreadth, numberContigs, numberReads]
    const coverageObj = accessionData.coverage[coverageIndex];
    const binSize = accessionData.coverage_bin_size;

    return [
      {
        name: "Coverage",
        data: [
          [
            "Base Pair Range",
            // \u2013 is en-dash
            `${Math.round(coverageObj[0] * binSize)}\u2013${Math.round(
              (coverageObj[0] + 1) * binSize
            )}`,
          ],
          ["Coverage Depth", `${coverageObj[1]}x`],
          ["Coverage Breadth", formatPercent(coverageObj[2])],
        ],
      },
    ];
  });

  handleHistogramBarEnter = hoverData => {
    const { data } = this.state;

    if (hoverData && hoverData[0] === 0) {
      this.setState({
        histogramTooltipData: this.getHistogramTooltipData(
          data.coverage_viz,
          hoverData[1]
        ),
      });
    }
  };

  handleHistogramBarHover = (clientX, clientY) => {
    this.setState({
      histogramTooltipLocation: {
        left: clientX,
        top: clientY,
      },
    });
  };

  handleHistogramBarExit = () => {
    this.setState({
      histogramTooltipLocation: null,
      histogramTooltipData: null,
    });
  };

  renderHistogram = () => {
    const { data } = this.state;

    const coverageVizData = data.coverage_viz.coverage.map(valueArr => ({
      x0: valueArr[0] * data.coverage_viz.coverage_bin_size,
      length: valueArr[1], // Actually the height. This is a d3-histogram naming convention.
    }));

    this.coverageViz = new Histogram(
      this.coverageVizContainer,
      [coverageVizData],
      {
        barOpacity: 1,
        colors: [FILL_COLOR],
        domain: [0, data.coverage_viz.total_length],
        hoverColors: [HOVER_FILL_COLOR],
        labelY: "Coverage",
        labelYHorizontalOffset: 15,
        labelYLarge: true,
        margins: {
          left: 100,
          right: 40,
          top: 30,
          bottom: 30,
        },
        numBins: Math.round(
          data.coverage_viz.total_length / data.coverage_viz.coverage_bin_size
        ),
        numTicksY: 2,
        showStatistics: false,
        skipBins: true,
        yScaleLog: true,
        onHistogramBarHover: this.handleHistogramBarHover,
        onHistogramBarEnter: this.handleHistogramBarEnter,
        onHistogramBarExit: this.handleHistogramBarExit,
      }
    );
    this.coverageViz.update();
  };

  getAccessionMetrics = () => {
    const { data } = this.state;
    const { sample } = this.props;

    const referenceNCBIEntry = (
      <BasicPopup
        trigger={
          <div className={cs.ncbiLinkWrapper}>
            <ExternalLink
              href={`https://www.ncbi.nlm.nih.gov/nuccore/${data.coverage_viz.accession_id}?report=genbank`}
              onClick={() =>
                logAnalyticsEvent("ConsensusGenomeView_ncbi-link_clicked", {
                  accessionId: data.coverage_viz.accession_id,
                  taxonId: data.coverage_viz.taxonId,
                  sampleId: sample.id,
                })
              }
            >
              {data.coverage_viz.accession_id}
            </ExternalLink>
          </div>
        }
        inverted
        content={`${data.coverage_viz.accession_id} - ${data.coverage_viz.accession_name}`}
      />
    );

    return {
      referenceNCBIEntry,
      referenceLength: data.coverage_viz.total_length,
      coverageDepth: `${data.coverage_viz.coverage_depth}x`,
      coverageBreadth: formatPercent(data.coverage_viz.coverage_breadth),
    };
  };

  renderCoverage = () => {
    const metrics = this.getAccessionMetrics();
    return (
      <NarrowContainer className={cs.coverageContents}>
        <div className={cs.body}>
          <div className={cs.metrics}>
            {CONSENSUS_GENOME_VIEW_METRIC_COLUMNS.map((col, index) => (
              <div className={cs.column} key={index}>
                {col.map(metric => (
                  <div className={cs.metric} key={metric.key}>
                    <div className={cs.label}>
                      <BasicPopup
                        trigger={<div>{metric.name}</div>}
                        inverted
                        content={metric.tooltip}
                      />
                    </div>
                    <div className={cs.value}>{metrics[metric.key]}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div
            className={cs.coverageVizHistogram}
            ref={coverageVizContainer => {
              this.coverageVizContainer = coverageVizContainer;
            }}
          />
        </div>
      </NarrowContainer>
    );
  };

  renderMetricsTable = () => {
    const { data } = this.state;
    const metricsData = {
      taxon_name: data.taxon_name,
      ...data.quality_metrics,
    };

    const helpText = (
      <React.Fragment>
        These metrics help determine the quality of the reference genome.{" "}
        <ExternalLink
          href={CONSENSUS_GENOME_DOC_LINK}
          onClick={() =>
            logAnalyticsEvent(
              "ConsensusGenomeView_quality-metrics-help-link_clicked"
            )
          }
        >
          Learn more.
        </ExternalLink>
      </React.Fragment>
    );
    return (
      <div className={cs.section}>
        <div className={cs.title}>
          Is my consensus genome complete?
          <HelpIcon text={helpText} className={cs.helpIcon} />
        </div>
        <div className={cx(cs.metricsTable, cs.raisedContainer)}>
          <Table
            columns={this.computeQualityMetricColumns()}
            data={[metricsData]}
            defaultRowHeight={55}
            gridClassName={cs.tableGrid}
            headerClassName={cs.tableHeader}
            headerRowClassName={cs.tableHeaderRow}
            headerHeight={25}
            headerLabelClassName={cs.tableHeaderLabel}
            rowClassName={cs.tableRow}
          />
        </div>
      </div>
    );
  };

  computeQualityMetricColumns = () => {
    const renderRowCell = ({ cellData }, options = {}) => (
      <div className={cs.cell}>
        {cellData}
        {options && options.percent ? "%" : null}
      </div>
    );
    return [
      {
        cellRenderer: renderRowCell,
        dataKey: "taxon_name",
        flexGrow: 1,
        headerClassName: cs.primaryHeader,
        label: "Taxon",
        width: 315,
      },
      {
        cellRenderer: renderRowCell,
        columnData: {
          tooltip:
            "Number of reads aligning to the taxon in the NCBI NT/NR database.",
        },
        dataKey: "total_reads",
        flexGrow: 1,
        label: "Reads",
      },
      {
        cellRenderer: cellData => renderRowCell(cellData, { percent: true }),
        columnData: {
          tooltip:
            "The percentage of bases that are either guanine (G) or cytosine (C).",
        },
        dataKey: "gc_percent",
        flexGrow: 1,
        label: "GC Content",
      },
      {
        cellRenderer: renderRowCell,
        columnData: {
          tooltip:
            "The number of single nucleotide polymorphisms (SNPs) - locations where the nucleotide of the consensus genome does not match the base of the reference genome",
        },
        dataKey: "ref_snps",
        flexGrow: 1,
        label: "SNPs",
      },
      {
        cellRenderer: cellData => renderRowCell(cellData, { percent: true }),
        columnData: {
          tooltip:
            "The percentage of nucleotides of the consensus genome that are identical to those in the reference genome.",
        },
        dataKey: "percent_identity",
        flexGrow: 1,
        label: "%id",
      },
      {
        cellRenderer: renderRowCell,
        columnData: {
          tooltip: "The number of nucleotides that are A,T,C, or G.",
        },
        dataKey: "n_actg",
        flexGrow: 1,
        label: "Informative Nucleotides",
        width: 150,
      },
      {
        cellRenderer: renderRowCell,
        columnData: {
          tooltip:
            "The number of bases that are N's because they could not be called.",
        },
        dataKey: "n_missing",
        flexGrow: 1,
        label: "Missing Bases",
        width: 100,
      },
      {
        cellRenderer: renderRowCell,
        columnData: {
          tooltip:
            "The number of bases that could not be specified due to multiple observed alleles of single-base polymorphisms.",
        },
        dataKey: "n_ambiguous",
        flexGrow: 1,
        label: "Ambiguous Bases",
        width: 100,
      },
    ];
  };

  render() {
    const { sample } = this.props;
    const { workflow } = this;

    if (workflow.status === "SUCCEEDED") {
      return this.renderResults();
    } else if (workflow.status === "RUNNING" || !workflow.status) {
      return (
        <SampleMessage
          icon={<LoadingIcon className={csSampleMessage.icon} />}
          link={CONSENSUS_GENOME_DOC_LINK}
          linkText={"Learn about Consensus Genomes"}
          message={"Your Consensus Genome is being generated!"}
          status={"IN PROGRESS"}
          type={"inProgress"}
          onClick={() =>
            logAnalyticsEvent(
              "ConsensusGenomeView_consenus-genome-doc-link_clicked"
            )
          }
        />
      );
    } else {
      // FAILED
      const { link, linkText, message, status, type } = sampleErrorInfo({
        sample,
        error: workflow.input_error || {},
      });
      return (
        <SampleMessage
          icon={<IconAlert type={type} />}
          link={link}
          linkText={linkText}
          message={message}
          status={status}
          type={type}
          onClick={() =>
            logAnalyticsEvent(
              "ConsensusGenomeView_sample-error-info-link_clicked"
            )
          }
        />
      );
    }
  }
}

ConsensusGenomeView.propTypes = {
  sample: PropTypes.object,
};

export default ConsensusGenomeView;
