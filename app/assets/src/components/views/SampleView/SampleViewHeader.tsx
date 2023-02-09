import { Button, Icon } from "czifui";
import { get, isEmpty, size } from "lodash/fp";
import React, { useContext, useState } from "react";
import { deleteSample, saveVisualization } from "~/api";
import {
  ANALYTICS_EVENT_NAMES,
  withAnalytics,
  trackEvent,
} from "~/api/analytics";
import BasicPopup from "~/components/BasicPopup";
import { UserContext } from "~/components/common/UserContext";
import ViewHeader from "~/components/layout/ViewHeader";
import {
  showAppcue,
  SAMPLE_VIEW_HEADER_MNGS_HELP_SIDEBAR,
  SAMPLE_VIEW_HEADER_CG_HELP_SIDEBAR,
} from "~/components/utils/appcues";
import { generateUrlToSampleView } from "~/components/utils/urls";
import { WORKFLOWS, findInWorkflows } from "~/components/utils/workflows";
import { getWorkflowRunZipLink } from "~/components/views/report/utils/download";
import { parseUrlParams } from "~/helpers/url";
import Project from "~/interface/project";
import ReportMetadata from "~/interface/reportMetaData";
import Sample, { WorkflowRun } from "~/interface/sample";
import { CurrentTabSample } from "~/interface/sampleView";
import { PipelineRun } from "~/interface/shared";
import {
  DownloadButton,
  ErrorButton,
  HelpButton,
  SaveButton,
  ShareButton,
} from "~ui/controls/buttons";
import { openUrl } from "~utils/links";
import PipelineRunSampleViewControls from "./PipelineRunSampleViewControls";
import PipelineVersionSelect from "./PipelineVersionSelect";
import SampleDeletionConfirmationModal from "./SampleDeletionConfirmationModal";

import cs from "./sample_view_header.scss";

export default function SampleViewHeader({
  backgroundId,
  currentTab,
  deletable,
  editable,
  getDownloadReportTableWithAppliedFiltersLink,
  hasAppliedFilters,
  onDetailsClick,
  onPipelineVersionChange,
  currentRun,
  project,
  projectSamples,
  reportMetadata,
  sample,
  snapshotShareId,
  view,
  onShareClick,
}: SampleViewHeaderProps) {
  const [
    sampleDeletionConfirmationModalOpen,
    setSampleDeletionConfirmationModalOpen,
  ] = useState(false);

  const userContext = useContext(UserContext);
  const { allowedFeatures, admin: userIsAdmin } = userContext || {};
  const workflow =
    WORKFLOWS[findInWorkflows(currentTab, "label")]?.value ||
    WORKFLOWS.SHORT_READ_MNGS.value;

  const mngsWorkflow = [
    WORKFLOWS.SHORT_READ_MNGS.value,
    WORKFLOWS.LONG_READ_MNGS.value,
  ].includes(workflow);

  const renderPipelineRunsPageButton = () => (
    <Button
      className={cs.controlElement}
      sdsStyle="rounded"
      sdsType="secondary"
      onClick={() => (location.href = `/samples/${sample?.id}/pipeline_runs`)}
    >
      Pipeline Runs
    </Button>
  );

  const onSaveClick = async () => {
    if (view) {
      const params = parseUrlParams();
      params.sampleIds = sample?.id;
      await saveVisualization(view, params);
    }
  };

  const renderShareButton = () => {
    return (
      <>
        <BasicPopup
          trigger={
            <ShareButton className={cs.controlElement} onClick={onShareClick} />
          }
          content="A shareable URL was copied to your clipboard!"
          on="click"
          hideOnScroll
        />
      </>
    );
  };

  const handleDeleteSample = async () => {
    await deleteSample(sample?.id);
    location.href = `/home?project_id=${project.id}`;
    trackEvent("SampleViewHeader_delete-sample-button_clicked", {
      sampleId: sample?.id,
      sampleName: sample?.name,
    });
  };

  const renderSampleViewControlsTopRow = () => {
    return (
      <div className={cs.controlsTopRowContainer}>
        <PipelineVersionSelect
          sampleId={get("id", sample)}
          shouldIncludeDatabaseVersion={false}
          currentRun={currentRun}
          allRuns={getAllRuns()}
          workflowType={workflow}
          versionKey={mngsWorkflow ? "pipeline_version" : "wdl_version"}
          timeKey={mngsWorkflow ? "created_at" : "executed_at"}
          onVersionChange={onPipelineVersionChange}
        />
        <Button
          sdsType="primary"
          sdsStyle="minimal"
          isAllCaps={true}
          onClick={withAnalytics(
            onDetailsClick,
            "SampleView_sample-details-link_clicked",
            {
              sampleId: sample?.id,
            },
          )}
        >
          Sample Details
        </Button>
      </div>
    );
  };

  const renderPipelineRunSampleViewControls = () => (
    <PipelineRunSampleViewControls
      className={cs.controlElement}
      backgroundId={backgroundId}
      currentTab={currentTab}
      deletable={deletable}
      editable={editable}
      getDownloadReportTableWithAppliedFiltersLink={
        getDownloadReportTableWithAppliedFiltersLink
      }
      onDeleteSample={() => setSampleDeletionConfirmationModalOpen(true)}
      hasAppliedFilters={hasAppliedFilters}
      pipelineRun={currentRun as PipelineRun}
      reportMetadata={reportMetadata}
      sample={sample}
      view={view}
    />
  );

  const renderShortReadMngsHelpButton = () => (
    <HelpButton
      className={cs.controlElement}
      onClick={showAppcue({
        flowId: SAMPLE_VIEW_HEADER_MNGS_HELP_SIDEBAR,
        analyticEventName:
          ANALYTICS_EVENT_NAMES.SAMPLE_VIEW_HEADER_MNGS_HELP_BUTTON_CLICKED,
      })}
    />
  );

  const renderConsensusGenomeHelpButton = () => (
    <HelpButton
      className={cs.controlElement}
      onClick={showAppcue({
        flowId: SAMPLE_VIEW_HEADER_CG_HELP_SIDEBAR,
        analyticEventName:
          ANALYTICS_EVENT_NAMES.SAMPLE_VIEW_HEADER_CONSENSUS_GENOME_HELP_BUTTON_CLICKED,
      })}
    />
  );

  const renderViewHeaderControls = () => {
    // Should hide CG appcues help button if a sample doesn't have the feature flag or (has 0 mNGS runs & 1 CG run)
    const shouldHideConsensusGenomeHelpButton =
      !allowedFeatures.includes("cg_appcues_help_button") ||
      (sample &&
        isEmpty(sample?.pipeline_runs) &&
        size(sample?.workflow_runs) === 1);
    if (workflow === WORKFLOWS.CONSENSUS_GENOME.value) {
      const succeeded = get("status", currentRun) === "SUCCEEDED";
      return (
        <ViewHeader.Controls>
          <div className={cs.controlsContainer}>
            {renderSampleViewControlsTopRow()}
            <div className={cs.controlsBottomRowContainer}>
              {userIsAdmin && renderPipelineRunsPageButton()}
              {succeeded && (
                <>
                  {renderShareButton()}
                  <DownloadButton
                    className={cs.controlElement}
                    text="Download All"
                    onClick={() => {
                      openUrl(getWorkflowRunZipLink(currentRun.id));
                      trackEvent(
                        "SampleViewHeader_consensus-genome-download-all-button_clicked",
                        {
                          sampleId: sample?.id,
                        },
                      );
                    }}
                  />
                </>
              )}
              {!succeeded &&
              editable &&
              deletable &&
              isEmpty(sample?.pipeline_runs) && ( // wouldn't want to delete mngs report
                  <ErrorButton
                    className={cs.controlElement}
                    onClick={() => setSampleDeletionConfirmationModalOpen(true)}
                    text="Delete Sample"
                  />
                )}
              {shouldHideConsensusGenomeHelpButton ||
                renderConsensusGenomeHelpButton()}
            </div>
          </div>
        </ViewHeader.Controls>
      );
    } else if (workflow === WORKFLOWS.AMR.value) {
      // This block is for amr PipelineRun reports.
      const succeeded = get("status", currentRun) === "SUCCEEDED";
      return (
        <ViewHeader.Controls>
          <div className={cs.controlsContainer}>
            {renderSampleViewControlsTopRow()}
            <div className={cs.controlsBottomRowContainer}>
              {userIsAdmin && renderPipelineRunsPageButton()}
              {succeeded && (
                <Button
                  className={cs.controlElement}
                  onClick={() => {
                    openUrl(getWorkflowRunZipLink(currentRun.id));
                    trackEvent(
                      "SampleViewHeader_amr-download-all-button_clicked",
                      {
                        sampleId: sample?.id,
                      },
                    );
                  }}
                  sdsStyle="rounded"
                  sdsType="primary"
                  startIcon={
                    <Icon sdsIcon="download" sdsSize="xl" sdsType="button" />
                  }
                >
                  Download All
                </Button>
              )}
            </div>
          </div>
        </ViewHeader.Controls>
      );
    } else if (workflow === WORKFLOWS.LONG_READ_MNGS.value) {
      // This block is for long-read-mngs PipelineRun reports.
      return (
        <ViewHeader.Controls>
          <div className={cs.controlsContainer}>
            {renderSampleViewControlsTopRow()}
            <div className={cs.controlsBottomRowContainer}>
              {userIsAdmin && renderPipelineRunsPageButton()}
              {!isEmpty(reportMetadata) && renderShareButton()}
              {userContext.admin && (
                <SaveButton
                  className={cs.controlElement}
                  onClick={withAnalytics(
                    onSaveClick,
                    "SampleView_save-button_clicked",
                    {
                      sampleId: sample && sample?.id,
                    },
                  )}
                />
              )}
              {renderPipelineRunSampleViewControls()}
            </div>
          </div>
        </ViewHeader.Controls>
      );
    } else {
      // This block is for short-read-mngs PipelineRun reports.
      return (
        <ViewHeader.Controls>
          <div className={cs.controlsContainer}>
            {renderSampleViewControlsTopRow()}
            <div>
              {userIsAdmin && renderPipelineRunsPageButton()}
              {!isEmpty(reportMetadata) && renderShareButton()}
              {userContext.admin && (
                <SaveButton
                  className={cs.controlElement}
                  onClick={withAnalytics(
                    onSaveClick,
                    "SampleView_save-button_clicked",
                    {
                      sampleId: sample && sample?.id,
                    },
                  )}
                />
              )}
              {renderPipelineRunSampleViewControls()}
              {!isEmpty(reportMetadata) && renderShortReadMngsHelpButton()}
            </div>
          </div>
        </ViewHeader.Controls>
      );
    }
  };

  const getBreadcrumbLink = () => {
    if (!project) return;
    return snapshotShareId
      ? `/pub/${snapshotShareId}`
      : `/home?project_id=${project.id}`;
  };

  const getAllRuns = () => {
    const runsByType =
      get("workflow_runs", sample) &&
      get("workflow_runs", sample).filter(run => run.workflow === workflow);
    return mngsWorkflow ? get("pipeline_runs", sample) : runsByType;
  };

  const renderViewHeaderContent = () => (
    <ViewHeader.Content>
      <ViewHeader.Pretitle breadcrumbLink={getBreadcrumbLink()}>
        {project ? project.name : ""}
      </ViewHeader.Pretitle>
      <ViewHeader.Title
        label={get("name", sample)}
        id={sample && sample?.id}
        options={projectSamples.map(sample => ({
          label: sample?.name,
          id: sample?.id,
          onClick: () => {
            openUrl(
              generateUrlToSampleView({
                sampleId: sample?.id,
                snapshotShareId,
              }),
            );
            trackEvent("SampleView_header-title_clicked", {
              sampleId: sample?.id,
            });
          },
        }))}
      />
    </ViewHeader.Content>
  );

  return (
    <>
      <ViewHeader className={cs.viewHeader}>
        {renderViewHeaderContent()}
        {!snapshotShareId && renderViewHeaderControls()}
      </ViewHeader>
      {sampleDeletionConfirmationModalOpen && (
        <SampleDeletionConfirmationModal
          open
          onCancel={() => setSampleDeletionConfirmationModalOpen(false)}
          onConfirm={handleDeleteSample}
        />
      )}
    </>
  );
}

SampleViewHeader.defaultProps = {
  deletable: false,
  projectSample: [],
  reportMetadata: {},
};

interface SampleViewHeaderProps {
  backgroundId?: number;
  currentRun: WorkflowRun | PipelineRun;
  currentTab: CurrentTabSample;
  deletable: boolean;
  editable: boolean;
  getDownloadReportTableWithAppliedFiltersLink?: () => string;
  hasAppliedFilters: boolean;
  onDetailsClick: () => void;
  onPipelineVersionChange: (newPipelineVersion: string) => void;
  onShareClick: () => void;
  pipelineVersions?: string[];
  project: Project;
  projectSamples: Pick<Sample, "id" | "name">[];
  reportMetadata: ReportMetadata;
  sample: Sample;
  snapshotShareId?: string;
  view: string;
}
