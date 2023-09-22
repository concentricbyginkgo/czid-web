import { get } from "lodash/fp";
import React from "react";
import { trackEvent } from "~/api/analytics";
import ViewHeader from "~/components/layout/ViewHeader";
import { generateUrlToSampleView } from "~/components/utils/urls";
import {
  getWorkflowTypeFromLabel,
  isMngsWorkflow,
} from "~/components/utils/workflows";
import Project from "~/interface/project";
import ReportMetadata from "~/interface/reportMetaData";
import Sample, { WorkflowRun } from "~/interface/sample";
import { CurrentTabSample } from "~/interface/sampleView";
import { PipelineRun } from "~/interface/shared";
import { openUrl } from "~utils/links";
import { PrimaryHeaderControls } from "./components/PrimaryHeaderControls";
import { SecondaryHeaderControls } from "./components/SecondaryHeaderControls";
import cs from "./sample_view_header.scss";

interface SampleViewHeaderProps {
  backgroundId?: number;
  currentRun: WorkflowRun | PipelineRun;
  currentTab: CurrentTabSample;
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
  onDeleteRunSuccess: () => void;
}

export const SampleViewHeader = ({
  backgroundId,
  currentTab,
  getDownloadReportTableWithAppliedFiltersLink,
  hasAppliedFilters,
  onDetailsClick,
  onPipelineVersionChange,
  currentRun,
  project,
  projectSamples = [],
  reportMetadata = {},
  sample,
  snapshotShareId,
  view,
  onShareClick,
  onDeleteRunSuccess,
}: SampleViewHeaderProps) => {
  const getBreadcrumbLink = () => {
    if (!project) return;
    return snapshotShareId
      ? `/pub/${snapshotShareId}`
      : `/home?project_id=${project.id}`;
  };
  const workflow = getWorkflowTypeFromLabel(currentTab);

  const getAllRunsPerWorkflow = () => {
    const runsByType =
      get("workflow_runs", sample) &&
      get("workflow_runs", sample).filter(run => run.workflow === workflow);
    return isMngsWorkflow(workflow) ? get("pipeline_runs", sample) : runsByType;
  };

  return (
    <div className={cs.sampleViewHeader}>
      <ViewHeader className={cs.viewHeader}>
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
        {!snapshotShareId && (
          <ViewHeader.Controls>
            <SecondaryHeaderControls
              sample={sample}
              currentRun={currentRun}
              getAllRuns={getAllRunsPerWorkflow}
              workflow={workflow}
              onPipelineVersionChange={onPipelineVersionChange}
              onDetailsClick={onDetailsClick}
            />
            <PrimaryHeaderControls
              backgroundId={backgroundId}
              currentRun={currentRun}
              currentTab={currentTab}
              getDownloadReportTableWithAppliedFiltersLink={
                getDownloadReportTableWithAppliedFiltersLink
              }
              hasAppliedFilters={hasAppliedFilters}
              onShareClick={onShareClick}
              onDeleteRunSuccess={onDeleteRunSuccess}
              reportMetadata={reportMetadata}
              sample={sample}
              view={view}
              workflow={workflow}
            />
          </ViewHeader.Controls>
        )}
      </ViewHeader>
    </div>
  );
};
