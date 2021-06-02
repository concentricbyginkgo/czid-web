import cx from "classnames";
import {
  difference,
  find,
  forEach,
  isEmpty,
  union,
  pickBy,
  values,
} from "lodash/fp";
import React from "react";

import { logAnalyticsEvent, withAnalytics } from "~/api/analytics";
import { UserContext } from "~/components/common/UserContext";
import NarrowContainer from "~/components/layout/NarrowContainer";
import { GEN_VIRAL_CG_FEATURE } from "~/components/utils/features";
import PropTypes from "~/components/utils/propTypes";
import BulkDownloadModal from "~/components/views/bulk_download/BulkDownloadModal";
import { showBulkDownloadNotification } from "~/components/views/bulk_download/BulkDownloadNotification";
import { ObjectCollectionView } from "~/components/views/discovery/DiscoveryDataLayer";
import DiscoveryViewToggle from "~/components/views/discovery/DiscoveryViewToggle";
import QualityControl from "~/components/views/discovery/QualityControl";
import DiscoveryMap from "~/components/views/discovery/mapping/DiscoveryMap";
import csTableRenderer from "~/components/views/discovery/table_renderers.scss";
import NextcladeModal from "~/components/views/nextclade/NextcladeModal";
import PhyloTreeCreationModal from "~/components/views/phylo_tree/PhyloTreeCreationModal";
import CollectionModal from "~/components/views/samples/CollectionModal";
import InfiniteTable from "~/components/visualizations/table/InfiniteTable";
import { getURLParamString } from "~/helpers/url";
import BareDropdown from "~ui/controls/dropdowns/BareDropdown";
import {
  IconHeatmap,
  IconBackgroundModel,
  IconDownload,
  IconPhyloTree,
  IconNextcladeLarge,
} from "~ui/icons";
import Label from "~ui/labels/Label";
import { WORKFLOWS } from "~utils/workflows";

import {
  computeColumnsByWorkflow,
  DEFAULTS_BY_WORKFLOW,
} from "./ColumnConfiguration";
import ToolbarIcon from "./ToolbarIcon";
import { SARS_COV_2, TRIGGERS, WORKFLOW_TRIGGERS } from "./constants";
import cs from "./samples_view.scss";

const MAX_NEXTCLADE_SAMPLES = 200;

class SamplesView extends React.Component {
  constructor(props, context) {
    super(props);

    this.state = {
      phyloTreeCreationModalOpen: false,
      bulkDownloadModalOpen: false,
      nextcladeModalOpen: false,
      // This tooltip is reset whenever the selectedIds changes.
      bulkDownloadButtonTempTooltip: null,
      sarsCov2Count: 0,
      referenceSelectId: null,
    };

    const { snapshotShareId } = this.props;

    // TODO: Remove allowedFeatures argument once General Viral CG Flat List implementation (CH-127140)
    // It is passed in as an argument since static methods (TableRenderers) can't access React Context directly
    const { allowedFeatures = [] } = context || {};
    this.columnsByWorkflow = computeColumnsByWorkflow({
      basicIcon: !!snapshotShareId,
      allowedFeatures,
    });

    this.referenceSelectId = null;
  }

  componentDidUpdate(prevProps) {
    // Reset the tooltip whenever the selected samples changes.
    if (this.props.selectedIds !== prevProps.selectedIds) {
      this.setState({
        bulkDownloadButtonTempTooltip: null,
      });
    }
  }

  handleSelectRow = (value, checked, event) => {
    const { objects, selectedIds, onUpdateSelectedIds, workflow } = this.props;
    const { referenceSelectId } = this;

    let newSelected = new Set(selectedIds);
    if (event.shiftKey && referenceSelectId) {
      const ids = objects.getIntermediateIds({
        id1: referenceSelectId,
        id2: value,
      });
      if (checked) {
        forEach(v => {
          newSelected.add(v);
        }, ids);
      } else {
        forEach(v => {
          newSelected.delete(v);
        }, ids);
      }
    } else {
      if (checked) {
        newSelected.add(value);
      } else {
        newSelected.delete(value);
      }
    }
    this.referenceSelectId = value;

    onUpdateSelectedIds(newSelected);

    logAnalyticsEvent("SamplesView_row_selected", {
      rowIsChecked: checked,
      rowType: find({ value: workflow }, values(WORKFLOWS)).entity,
      selectedId: value,
      numberOfSelectedIds: newSelected.size,
      workflow,
    });
  };

  handleSelectAllRows = checked => {
    const { selectableIds, selectedIds, onUpdateSelectedIds } = this.props;

    this.referenceSelectId = null;
    let newSelected = new Set(
      checked
        ? union(Array.from(selectedIds), selectableIds)
        : difference(Array.from(selectedIds), selectableIds)
    );
    onUpdateSelectedIds(newSelected);
  };

  // TODO: implement for workflow runs
  isSelectAllChecked = () => {
    const { selectableIds, selectedIds } = this.props;
    return (
      !isEmpty(selectableIds) &&
      isEmpty(difference(selectableIds, Array.from(selectedIds)))
    );
  };

  reset = () => {
    const { currentDisplay } = this.props;
    if (currentDisplay === "table") this.infiniteTable.reset();
  };

  renderHeatmapTrigger = () => {
    const { selectedIds } = this.props;

    const heatmapOptions = [
      { text: "Taxon Heatmap", value: "/visualizations/heatmap" },
      { text: "AMR Heatmap", value: "/amr_heatmap" },
    ];

    const heatmapIcon = <IconHeatmap className={cs.icon} />;

    return selectedIds.size < 2 ? (
      <ToolbarIcon
        className={cx(cs.action, cs.heatmap)}
        disabled
        icon={heatmapIcon}
        popupText="Heatmap"
        popupSubtitle="Select at least 2 samples"
      />
    ) : (
      <BareDropdown
        hideArrow
        className={cx(cs.action)}
        items={heatmapOptions.map(option => {
          const params = getURLParamString({
            sampleIds: Array.from(selectedIds),
          });
          const log = () =>
            logAnalyticsEvent("SamplesView_heatmap-option_clicked", {
              option,
              selectedIds: selectedIds.size,
            });
          return (
            <BareDropdown.Item
              key={option.text}
              text={<a href={`${option.value}?${params}`}>{option.text}</a>}
              onClick={log}
            />
          );
        })}
        trigger={
          <ToolbarIcon
            className={cs.heatmap}
            icon={heatmapIcon}
            popupText="Heatmap"
          />
        }
      />
    );
  };

  renderPhyloTreeTrigger = () => {
    const phyloTreeIcon = (
      <IconPhyloTree className={cx(cs.icon, cs.phyloTree)} />
    );
    return (
      <ToolbarIcon
        className={cs.action}
        icon={phyloTreeIcon}
        popupText="Phylogenetic Tree"
        onClick={withAnalytics(
          this.handlePhyloModalOpen,
          "SamplesView_phylo-tree-modal-open_clicked"
        )}
      />
    );
  };

  // TODO(omar): Make BulkDownloadModal support selected workflow runs [CH-136639]
  renderBulkDownloadTrigger = () => {
    const { selectedIds, workflow } = this.props;
    const { bulkDownloadButtonTempTooltip } = this.state;
    const downloadIcon = <IconDownload className={cx(cs.icon, cs.download)} />;
    return (
      <ToolbarIcon
        className={cs.action}
        icon={downloadIcon}
        popperDependencies={[bulkDownloadButtonTempTooltip]}
        popupText={bulkDownloadButtonTempTooltip || "Download"}
        popupSubtitle={selectedIds.size === 0 ? "Select at least 1 sample" : ""}
        disabled={selectedIds.size === 0}
        onClick={withAnalytics(
          this.handleBulkDownloadModalOpen,
          "SamplesView_bulk-download-modal-open_clicked",
          { workflow }
        )}
      />
    );
  };

  renderCollectionTrigger = () => {
    const { samples, selectedIds, workflow } = this.props;

    const targetSamples = samples.loaded;

    const backgroundIcon = (
      <IconBackgroundModel className={cx(cs.icon, cs.background)} />
    );

    return selectedIds.size < 2 ? (
      <ToolbarIcon
        className={cs.action}
        disabled
        icon={backgroundIcon}
        popupText="Background Model"
        popupSubtitle="Select at least 2 samples"
      />
    ) : (
      <CollectionModal
        trigger={
          <ToolbarIcon
            className={cs.action}
            icon={backgroundIcon}
            popupText="Background Model"
          />
        }
        selectedIds={selectedIds}
        fetchedSamples={targetSamples.filter(sample =>
          selectedIds.has(sample.id)
        )}
        workflow={workflow}
      />
    );
  };

  // TODO(omar): Make NextcladeModal support selected workflow runs [CH-136635]
  renderNextcladeTrigger = () => {
    const { objects, selectedIds } = this.props;
    const selectedSamples = objects.loaded.filter(sample =>
      selectedIds.has(sample.id)
    );

    const sarsCov2Count = selectedSamples
      .map(sample => sample.referenceGenome.taxonName)
      .reduce((n, taxonName) => {
        return n + (taxonName === SARS_COV_2);
      }, 0);

    const downloadIcon = (
      <IconNextcladeLarge className={cx(cs.icon, cs.nextclade)} />
    );
    const getPopupSubtitle = () => {
      if (sarsCov2Count > MAX_NEXTCLADE_SAMPLES) {
        return `Select at most ${MAX_NEXTCLADE_SAMPLES} SARS-CoV-2 samples`;
      } else if (sarsCov2Count === 0) {
        return "Select at least 1 SARS-CoV-2 sample";
      } else {
        return "";
      }
    };
    return (
      <ToolbarIcon
        className={cs.action}
        icon={downloadIcon}
        popupText="Nextclade"
        popupSubtitle={getPopupSubtitle()}
        disabled={sarsCov2Count === 0 || sarsCov2Count > MAX_NEXTCLADE_SAMPLES}
        onClick={withAnalytics(
          this.handleNextcladeModalOpen,
          "SamplesView_nextclade-modal-open_clicked"
        )}
      />
    );
  };

  renderTriggers = () => {
    const { selectedIds, workflow } = this.props;

    const triggers = {
      [TRIGGERS.backgroundModel]: this.renderCollectionTrigger,
      [TRIGGERS.heatmap]: this.renderHeatmapTrigger,
      [TRIGGERS.phylogeneticTree]: this.renderPhyloTreeTrigger,
      [TRIGGERS.download]: this.renderBulkDownloadTrigger,
      [TRIGGERS.nextclade]: this.renderNextcladeTrigger,
    };
    const triggersToRender = WORKFLOW_TRIGGERS[workflow].map(trigger => (
      <React.Fragment key={`${workflow}-${trigger}`}>
        {triggers[trigger]()}
      </React.Fragment>
    ));

    return (
      <>
        <div className={cs.counterContainer}>
          <Label
            circular
            className={cs.counter}
            // Log this no-op so we know if users want a way to view their selected samples
            onClick={() =>
              logAnalyticsEvent(`SamplesView_sample-counter_clicked`)
            }
            text={`${selectedIds.size}`}
          />
          <span className={cs.label}>Selected</span>
        </div>
        <div className={cs.separator} />
        <div className={cs.actions}>{triggersToRender}</div>
      </>
    );
  };

  renderToolbar = () => {
    const { hideAllTriggers } = this.props;
    return (
      <div className={cs.samplesToolbar}>
        {this.renderDisplaySwitcher()}
        <div className={cs.fluidBlank} />
        {!hideAllTriggers && this.renderTriggers()}
      </div>
    );
  };

  renderTable = () => {
    const { allowedFeatures = [] } = this.context || {};
    const {
      activeColumns,
      hideAllTriggers,
      onActiveColumnsChange,
      onLoadRows,
      protectedColumns,
      selectedIds,
      workflow,
    } = this.props;

    // TODO(tiago): replace by automated cell height computing
    // TODO: Remove this ternary and set rowHeight to 66 after General Viral CG Flat List implementation
    const rowHeight =
      allowedFeatures.includes(GEN_VIRAL_CG_FEATURE) &&
      workflow === WORKFLOWS.CONSENSUS_GENOME.value
        ? 70
        : 66;
    const selectAllChecked = this.isSelectAllChecked();
    return (
      <div className={cs.table}>
        <InfiniteTable
          ref={infiniteTable => (this.infiniteTable = infiniteTable)}
          columns={this.columnsByWorkflow[workflow]}
          defaultRowHeight={rowHeight}
          initialActiveColumns={activeColumns}
          loadingClassName={csTableRenderer.loading}
          onActiveColumnsChange={onActiveColumnsChange}
          onLoadRows={onLoadRows}
          onSelectAllRows={withAnalytics(
            this.handleSelectAllRows,
            "SamplesView_select-all-rows_clicked"
          )}
          onSelectRow={this.handleSelectRow}
          onRowClick={this.handleRowClick}
          protectedColumns={protectedColumns}
          rowClassName={cs.tableDataRow}
          selectableKey={hideAllTriggers ? null : "id"}
          selected={selectedIds}
          selectAllChecked={selectAllChecked}
          selectableCellClassName={cs.selectableCell}
        />
      </div>
    );
  };

  renderDisplaySwitcher = () => {
    const { currentDisplay, onDisplaySwitch, projectId, workflow } = this.props;
    const { allowedFeatures = {} } = this.context || {};

    return (
      <DiscoveryViewToggle
        currentDisplay={currentDisplay}
        onDisplaySwitch={display => {
          onDisplaySwitch(display);
          logAnalyticsEvent(`SamplesView_${display}-switch_clicked`);
        }}
        includePLQC={
          !!projectId &&
          workflow === WORKFLOWS.SHORT_READ_MNGS.value &&
          allowedFeatures.includes("plqc")
        }
      />
    );
  };

  renderMap = () => {
    const {
      currentTab,
      mapLevel,
      mapLocationData,
      mapPreviewedLocationId,
      mapTilerKey,
      onClearFilters,
      onMapLevelChange,
      onMapClick,
      onMapMarkerClick,
      onMapTooltipTitleClick,
    } = this.props;

    return (
      <div className={cs.map}>
        <DiscoveryMap
          currentTab={currentTab}
          mapLevel={mapLevel}
          mapLocationData={mapLocationData}
          mapTilerKey={mapTilerKey}
          onClearFilters={onClearFilters}
          onClick={onMapClick}
          onMapLevelChange={onMapLevelChange}
          onMarkerClick={onMapMarkerClick}
          onTooltipTitleClick={onMapTooltipTitleClick}
          previewedLocationId={mapPreviewedLocationId}
        />
      </div>
    );
  };

  renderQualityControl = () => {
    const {
      projectId,
      onPLQCHistogramBarClick,
      filters,
      filtersSidebarOpen,
      sampleStatsSidebarOpen,
    } = this.props;
    return (
      <div className={cs.table}>
        <QualityControl
          projectId={projectId}
          handleBarClick={onPLQCHistogramBarClick}
          filters={filters}
          filtersSidebarOpen={filtersSidebarOpen}
          sampleStatsSidebarOpen={sampleStatsSidebarOpen}
        />
      </div>
    );
  };

  renderDisplay = () => {
    const { currentDisplay } = this.props;
    switch (currentDisplay) {
      case "table":
        return this.renderTable();
      case "map":
        return this.renderMap();
      case "plqc":
        return this.renderQualityControl();
    }
  };

  handlePhyloModalOpen = () => {
    this.setState({ phyloTreeCreationModalOpen: true });
  };

  handlePhyloModalClose = () => {
    this.setState({ phyloTreeCreationModalOpen: false });
  };

  handleBulkDownloadModalOpen = () => {
    const { appConfig, admin } = this.context || {};
    if (!appConfig.maxSamplesBulkDownload) {
      this.setState({
        bulkDownloadButtonTempTooltip:
          "Unexpected issue. Please contact us for help.",
      });
    } else if (
      this.props.selectedIds.size > appConfig.maxSamplesBulkDownload &&
      !admin
    ) {
      // There is a separate max sample limit for the original input file download type.
      // This is checked in BulkDownloadModal, and the original input file option is disabled if there
      // are too many samples.
      this.setState({
        bulkDownloadButtonTempTooltip: `No more than ${appConfig.maxSamplesBulkDownload} samples allowed in one download.`,
      });
    } else {
      this.setState({ bulkDownloadModalOpen: true });
    }
  };

  handleBulkDownloadModalClose = () => {
    this.setState({ bulkDownloadModalOpen: false });
  };

  handleBulkDownloadGenerate = () => {
    this.handleBulkDownloadModalClose();
    showBulkDownloadNotification();
  };

  handleNextcladeModalOpen = () => {
    this.setState({ nextcladeModalOpen: true });
  };

  handleNextcladeModalClose = () => {
    this.setState({ nextcladeModalOpen: false });
  };

  handleRowClick = ({ event, rowData }) => {
    const { onSampleSelected, samples } = this.props;
    const sample = samples.get(rowData.id);
    onSampleSelected && onSampleSelected({ sample, currentEvent: event });
    logAnalyticsEvent("SamplesView_row_clicked", {
      sampleId: sample.id,
      sampleName: sample.name,
    });
  };

  render() {
    const {
      currentDisplay,
      samples,
      selectedIds,
      snapshotShareId,
      workflow,
    } = this.props;
    const {
      phyloTreeCreationModalOpen,
      bulkDownloadModalOpen,
      nextcladeModalOpen,
    } = this.state;

    return (
      <div className={cs.container}>
        {currentDisplay === "table" || currentDisplay === "plqc" ? (
          !snapshotShareId && this.renderToolbar()
        ) : (
          <NarrowContainer>{this.renderToolbar()}</NarrowContainer>
        )}
        {this.renderDisplay()}
        {phyloTreeCreationModalOpen && (
          <PhyloTreeCreationModal
            // TODO(tiago): migrate phylo tree to use api (or read csrf from context) and remove this
            csrf={document.getElementsByName("csrf-token")[0].content}
            onClose={withAnalytics(
              this.handlePhyloModalClose,
              "SamplesView_phylo-tree-modal_closed"
            )}
          />
        )}
        {bulkDownloadModalOpen && (
          <BulkDownloadModal
            open
            onClose={withAnalytics(
              this.handleBulkDownloadModalClose,
              "SamplesView_bulk-download-modal_closed"
            )}
            selectedSampleIds={selectedIds}
            workflow={workflow}
            onGenerate={this.handleBulkDownloadGenerate}
          />
        )}
        {nextcladeModalOpen && (
          <NextcladeModal
            open
            onClose={withAnalytics(
              this.handleNextcladeModalClose,
              "SamplesView_nextclade-modal_closed"
            )}
            samples={pickBy(s => selectedIds.has(s.id), samples.entries)}
          />
        )}
      </div>
    );
  }
}

SamplesView.defaultProps = {
  activeColumns: DEFAULTS_BY_WORKFLOW[WORKFLOWS.SHORT_READ_MNGS.value],
  protectedColumns: ["sample"],
  currentDisplay: "table",
  workflow: WORKFLOWS.SHORT_READ_MNGS.value,
};

SamplesView.propTypes = {
  activeColumns: PropTypes.arrayOf(PropTypes.string),
  admin: PropTypes.bool,
  currentDisplay: PropTypes.string.isRequired,
  currentTab: PropTypes.string.isRequired,
  filters: PropTypes.object,
  filtersSidebarOpen: PropTypes.bool,
  hideAllTriggers: PropTypes.bool,
  mapLevel: PropTypes.string,
  mapLocationData: PropTypes.objectOf(PropTypes.Location),
  mapPreviewedLocationId: PropTypes.number,
  mapTilerKey: PropTypes.string,
  objects: PropTypes.instanceOf(ObjectCollectionView),
  onActiveColumnsChange: PropTypes.func,
  onClearFilters: PropTypes.func,
  onDisplaySwitch: PropTypes.func,
  onLoadRows: PropTypes.func.isRequired,
  onMapClick: PropTypes.func,
  onMapLevelChange: PropTypes.func,
  onMapMarkerClick: PropTypes.func,
  onMapTooltipTitleClick: PropTypes.func,
  onPLQCHistogramBarClick: PropTypes.func,
  onSampleSelected: PropTypes.func,
  onUpdateSelectedIds: PropTypes.func,
  projectId: PropTypes.number,
  protectedColumns: PropTypes.array,
  samples: PropTypes.instanceOf(ObjectCollectionView),
  sampleStatsSidebarOpen: PropTypes.bool,
  selectableIds: PropTypes.array,
  selectedIds: PropTypes.instanceOf(Set),
  snapshotShareId: PropTypes.string,
  workflow: PropTypes.string,
};

SamplesView.contextType = UserContext;

export default SamplesView;
