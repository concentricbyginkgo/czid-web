import { size, find, omit, isEmpty, getOr } from "lodash/fp";
import { diff } from "~/components/utils/objectUtil";
import {
  findInWorkflows,
  WorkflowCount,
  WORKFLOWS,
  WORKFLOW_ENTITIES,
} from "~/components/utils/workflows";
import Sample from "~/interface/sample";
import { FilterSelections } from "~/interface/sampleView";
import { TABS, TREE_METRICS } from "./constants";

export const getWorkflowCount = (sample: Sample): WorkflowCount => {
  const count = {};
  Object.keys(WORKFLOWS).forEach(workflow => {
    switch (WORKFLOWS[workflow].entity) {
      case WORKFLOW_ENTITIES.SAMPLES:
        /* This line works to separate Illumina/Nanopore because all pipeline runs for a
        sample will be of one technology type (Illumina or Nanopore).
        Equivalently, to deprecate initial_workflow we could update samples_controller#show
        to return technology and filter the pipeline runs by technology. */
        count[WORKFLOWS[workflow].value] =
          sample.initial_workflow === WORKFLOWS[workflow].value &&
          size(sample.pipeline_runs);
        break;
      case WORKFLOW_ENTITIES.WORKFLOW_RUNS:
        count[WORKFLOWS[workflow].value] = size(
          sample.workflow_runs.filter(
            (run: $TSFixMe) => run.workflow === WORKFLOWS[workflow].value,
          ),
        );
        break;
      default:
        break;
    }
  });
  return count;
};

export const getDefaultSelectedOptions = () => {
  return {
    annotations: [],
    background: null,
    categories: { categories: [], subcategories: { Viruses: [] } },
    // Don't set the default metric as 'aggregatescore' because it computed based on the background model and will error if the background model is 'None'.
    metric: find({ value: "nt_r" }, TREE_METRICS).value,
    nameType: "Scientific name",
    readSpecificity: 0,
    taxa: [],
    thresholds: [],
  };
};

export const determineInitialTab = ({
  initialWorkflow,
  workflowCount: {
    [WORKFLOWS.SHORT_READ_MNGS.value]: shortReadMngs,
    [WORKFLOWS.LONG_READ_MNGS.value]: longReadMngs,
    [WORKFLOWS.CONSENSUS_GENOME.value]: cg,
    [WORKFLOWS.AMR.value]: amr,
  },
}: $TSFixMe) => {
  if (shortReadMngs) {
    return TABS.SHORT_READ_MNGS;
  } else if (longReadMngs) {
    return TABS.LONG_READ_MNGS;
  } else if (cg) {
    return TABS.CONSENSUS_GENOME;
  } else if (amr) {
    return TABS.AMR;
  } else if (initialWorkflow) {
    return TABS[findInWorkflows(initialWorkflow, "value")];
  } else {
    return TABS.SHORT_READ_MNGS;
  }
};

export const getAppliedFilters = (
  selectedOptions,
): Omit<FilterSelections, "nameType" | "metric" | "background"> => {
  // Only Taxon, Category, Subcategories, Read Specifity, and Threshold Filters are considered "Applied Filters"
  return omit(
    ["nameType", "metric", "background"],
    diff(selectedOptions, getDefaultSelectedOptions()),
  ) as Omit<FilterSelections, "nameType" | "metric" | "background">;
};

export const hasAppliedFilters = selectedOptions => {
  const { categories, readSpecificity, taxa, thresholds } = selectedOptions;

  const hasCategoryFilters =
    !isEmpty(getOr([], "categories", categories)) ||
    !isEmpty(getOr([], "subcategories.Viruses", categories));
  const hasReadSpecificityFilters = readSpecificity !== 0;
  const hasTaxonFilter = !isEmpty(taxa);
  const hasThresholdFilters = !isEmpty(thresholds);

  return (
    hasCategoryFilters ||
    hasReadSpecificityFilters ||
    hasTaxonFilter ||
    hasThresholdFilters
  );
};
