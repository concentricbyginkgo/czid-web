import { filter, get, isEmpty, pullAll } from "lodash/fp";
import React, { useContext } from "react";
import { UserContext } from "~/components/common/UserContext";
import { BULK_DELETION_FEATURE } from "~/components/utils/features";
import {
  getShorthandFromWorkflow,
  WORKFLOW_ENTITIES,
  WORKFLOW_VALUES,
} from "~/components/utils/workflows";
import {
  BaseWorkflowRun,
  CGRun,
  PipelineTypeRun,
} from "~/interface/samplesView";
import ToolbarButtonIcon from "../ToolbarButtonIcon";
import cs from "../samples_view.scss";

type ObjectType = PipelineTypeRun | BaseWorkflowRun | CGRun;

interface BulkDeleteTriggerProps {
  onClick(): void;
  selectedObjects: ObjectType[];
  workflow: WORKFLOW_VALUES;
  workflowEntity: string;
}

const BulkDeleteTrigger = ({
  onClick,
  selectedObjects,
  workflow,
  workflowEntity,
}: BulkDeleteTriggerProps) => {
  const { allowedFeatures, userId } = useContext(UserContext) ?? {};

  // if feature flag off, show nothing
  if (!allowedFeatures.includes(BULK_DELETION_FEATURE)) {
    return null;
  }

  const didUserUploadAtLeastOneObjectWithCompleteRun = () => {
    // selected samples uploaded by current user
    const samplesUploadedByUser = filter(obj => {
      const uploadedBy = obj.sample?.userId;
      return uploadedBy === userId;
    }, selectedObjects);

    // if user didn't upload any of the selected samples,
    // we can return false without checking if any of them completed,
    // since the user can't delete these anyway
    if (!samplesUploadedByUser) return false;

    // if user uploaded something, check if any of the ones they uploaded completed
    if (workflowEntity === WORKFLOW_ENTITIES.WORKFLOW_RUNS) {
      const runStatuses = samplesUploadedByUser.map(object =>
        get(["status"], object),
      );
      const didAtLeastOneComplete = !isEmpty(
        pullAll(["running", "created"], runStatuses),
      );

      return didAtLeastOneComplete;
    }

    const statuses = samplesUploadedByUser.map(object =>
      get(["sample", "pipelineRunFinalized"], object),
    );

    return statuses.includes(1);
  };

  let disabled = false;
  let disabledMessage = "";
  let shouldInvertTooltip = true;
  let primaryText = `Delete ${getShorthandFromWorkflow(workflow)} Run`;

  // disabled because no samples selected in table
  if (selectedObjects?.length === 0) {
    disabled = true;
    disabledMessage = "Select at least 1 sample";
    // disabled because all selected samples cannot be deleted by this user at this time
  } else if (!didUserUploadAtLeastOneObjectWithCompleteRun()) {
    disabled = true;
    shouldInvertTooltip = false;
    primaryText = "";
    disabledMessage =
      "The Selected Samples can’t be deleted because they were all run by another user or are still being processed.";
  }

  return (
    <ToolbarButtonIcon
      className={cs.action}
      icon="trashCan"
      disabled={disabled}
      popupSubtitle={disabledMessage}
      popupText={primaryText}
      onClick={onClick}
      inverted={shouldInvertTooltip}
    />
  );
};

export { BulkDeleteTrigger };