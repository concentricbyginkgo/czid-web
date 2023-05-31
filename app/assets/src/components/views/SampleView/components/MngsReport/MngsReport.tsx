import { isNil } from "lodash";
import React from "react";
import { withAnalytics } from "~/api/analytics";
import { TABS } from "../../constants";
import { getConsensusGenomeData } from "../../utils";
import { SampleViewMessage } from "../SampleViewMessage";
import { ReportFilters } from "./components/ReportFilters";
import { ReportStatsRow } from "./components/ReportStatsRow";
import { ReportTable } from "./components/ReportTable";
import { ReportViewSelector } from "./components/ReportViewSelector";
import { TaxonTreeVis } from "./components/TaxonTreeVis";
import cs from "./mngs_report.scss";
import { MngsReportProps } from "./types";

export const MngsReport = ({
  backgrounds,
  currentTab,
  clearAllFilters,
  enableMassNormalizedBackgrounds,
  filteredReportData,
  handleAnnotationUpdate,
  handleBlastClick,
  handleConsensusGenomeClick,
  handleCoverageVizClick,
  handlePreviousConsensusGenomeClick,
  handleOptionChanged,
  handleTaxonClick,
  handleViewClick,
  refreshDataFromOptionsChange,
  lineageData,
  loadingReport,
  ownedBackgrounds,
  otherBackgrounds,
  pipelineRun,
  project,
  reportData,
  reportMetadata,
  sample,
  selectedOptions,
  snapshotShareId,
  view,
}: MngsReportProps) => {
  const displayMergedNtNrValue = currentTab === TABS.MERGED_NT_NR;
  if (reportMetadata.reportReady) {
    return (
      <div className={cs.reportViewContainer}>
        <ReportFilters
          backgrounds={backgrounds}
          loadingReport={loadingReport}
          ownedBackgrounds={ownedBackgrounds}
          otherBackgrounds={otherBackgrounds}
          shouldDisableFilters={displayMergedNtNrValue}
          refreshDataFromOptionsChange={refreshDataFromOptionsChange}
          onFilterChanged={handleOptionChanged}
          sampleId={sample?.id}
          selected={selectedOptions}
          view={view}
          enableMassNormalizedBackgrounds={enableMassNormalizedBackgrounds}
          snapshotShareId={snapshotShareId}
          currentTab={currentTab}
        />
        <div className={cs.reportHeader}>
          <ReportStatsRow
            currentTab={currentTab}
            filteredReportData={filteredReportData}
            reportData={reportData}
            reportMetadata={reportMetadata}
            selectedOptions={selectedOptions}
            clearAllFilters={clearAllFilters}
          />
          <ReportViewSelector view={view} onViewClick={handleViewClick} />
        </div>
        {view === "table" && (
          <ReportTable
            alignVizAvailable={!!reportMetadata?.alignVizAvailable}
            consensusGenomeData={getConsensusGenomeData(sample)}
            consensusGenomeEnabled={sample?.editable}
            currentTab={currentTab}
            data={filteredReportData}
            displayMergedNtNrValue={displayMergedNtNrValue}
            displayNoBackground={isNil(selectedOptions.background)}
            fastaDownloadEnabled={!!reportMetadata?.hasByteRanges}
            initialDbType={displayMergedNtNrValue ? "merged_nt_nr" : "nt"}
            onAnnotationUpdate={handleAnnotationUpdate}
            onBlastClick={handleBlastClick}
            onConsensusGenomeClick={handleConsensusGenomeClick}
            onCoverageVizClick={handleCoverageVizClick}
            onPreviousConsensusGenomeClick={handlePreviousConsensusGenomeClick}
            onTaxonNameClick={withAnalytics(
              handleTaxonClick,
              "PipelineSampleReport_taxon-sidebar-link_clicked",
            )}
            phyloTreeAllowed={sample ? sample.editable : false}
            pipelineVersion={pipelineRun?.pipeline_version}
            pipelineRunId={pipelineRun?.id}
            projectId={project?.id}
            projectName={project?.name}
            sampleId={sample?.id}
            snapshotShareId={snapshotShareId}
          />
        )}
        {view === "tree" && filteredReportData.length > 0 && (
          <TaxonTreeVis
            lineage={lineageData}
            metric={
              currentTab === TABS.SHORT_READ_MNGS
                ? selectedOptions.metricShortReads
                : selectedOptions.metricLongReads
            }
            nameType={selectedOptions.nameType}
            onTaxonClick={handleTaxonClick}
            taxa={filteredReportData}
            currentTab={currentTab}
          />
        )}
      </div>
    );
  } else {
    // The report is either in progress or encountered an error.
    return (
      <SampleViewMessage
        currentTab={currentTab}
        loadingReport={loadingReport}
        pipelineRun={pipelineRun}
        reportMetadata={reportMetadata}
        sample={sample}
        snapshotShareId={snapshotShareId}
      />
    );
  }
};