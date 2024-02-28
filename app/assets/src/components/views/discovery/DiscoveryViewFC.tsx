import { toLower } from "lodash/fp";
import React, { useContext, useRef, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import { fetchQuery, graphql } from "relay-runtime";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";
import { UserContext } from "~/components/common/UserContext";
import { logError } from "~/components/utils/logUtil";
import { isNotNullish } from "~/components/utils/typeUtils";
import { WorkflowType } from "~/components/utils/workflows";
import {
  ActionType,
  createAction,
  GlobalContext,
} from "~/globalContext/reducer";
import { formatSemanticVersion } from "~/helpers/strings";
import { Conditions, DiscoveryViewProps } from "~/interface/discoveryView";
import {
  CgEntityRow,
  CgRow,
  Metadata,
  WorkflowRunRow,
} from "../samples/SamplesView/SamplesView";
import { DiscoveryViewFCSequencingReadsQuery as DiscoveryViewFCSequencingReadsQueryType } from "./__generated__/DiscoveryViewFCSequencingReadsQuery.graphql";
import {
  DiscoveryViewFCWorkflowsQuery as DiscoveryViewFCWorkflowsQueryType,
  queryInput_workflowRuns_input_Input,
  queryInput_workflowRuns_input_where_Input,
} from "./__generated__/DiscoveryViewFCWorkflowsQuery.graphql";
import { formatWetlabProtocol } from "./discovery_api";
import { DiscoveryView } from "./DiscoveryView";

// TODO(bchu): Add entityInputsInput.
const DiscoveryViewFCWorkflowsQuery = graphql`
  query DiscoveryViewFCWorkflowsQuery(
    $input: queryInput_workflowRuns_input_Input
  ) {
    workflowRuns(input: $input) {
      id
      startedAt
      status
      workflowVersion {
        version
        workflow {
          name
        }
      }
      entityInputs {
        edges {
          node {
            inputEntityId
            entityType
          }
        }
      }
    }
  }
`;

const DiscoveryViewFCSequencingReadsQuery = graphql`
  query DiscoveryViewFCSequencingReadsQuery(
    $input: queryInput_sequencingReads_input_Input
  ) {
    sequencingReads(input: $input) {
      id
      nucleicAcid
      protocol
      medakaModel
      technology
      taxon {
        name
      }
      sample {
        railsSampleId
        name
        notes
        collectionLocation
        sampleType
        waterControl
        uploadError
        hostOrganism {
          name
        }
        collection {
          name
          public
        }
        ownerUserId
        ownerUserName
        metadatas {
          edges {
            node {
              fieldName
              value
            }
          }
        }
      }
      consensusGenomes {
        edges {
          node {
            producingRunId
            taxon {
              name
            }
            referenceGenome {
              accessionId
              accessionName
            }
            metrics {
              coverageDepth
              totalReads
              gcPercent
              refSnps
              percentIdentity
              nActg
              percentGenomeCalled
              nMissing
              nAmbiguous
              referenceGenomeLength
            }
          }
        }
      }
    }
  }
`;

async function queryWorkflowRuns(
  workflow: WorkflowType,
  { projectId, search, orderBy, orderDir, filters }: Partial<Conditions>,
  props: DiscoveryViewProps,
  environment: RelayModernEnvironment,
): Promise<WorkflowRunRow[]> {
  // TODO: Filter out deprecateds.
  // Do not include NextGen argument fields that are null/empty arrays. NextGen will interpret them
  // as return nothing.
  const where: queryInput_workflowRuns_input_where_Input = {
    workflowVersion: { workflow: { name: { _in: ["consensus-genome"] } } },
  };
  if (projectId != null) {
    where.collectionId = { _in: [projectId] };
  }
  const input: queryInput_workflowRuns_input_Input = {
    where,
    todoRemove: {
      domain: props.domain,
      projectId: projectId?.toString(),
      search: search,
      host: filters?.host,
      locationV2: filters?.locationV2,
      taxon: filters?.taxon,
      taxonLevels: filters?.taxaLevels,
      time: filters?.time,
      tissue: filters?.tissue,
      visibility: filters?.visibility,
      orderBy,
      orderDir,
      workflow,
    },
    orderBy: { startedAt: orderBy === "createdAt" ? orderDir : null },
  };

  const data = await fetchQuery<DiscoveryViewFCWorkflowsQueryType>(
    environment,
    DiscoveryViewFCWorkflowsQuery,
    {
      input,
    },
  ).toPromise();
  if (data?.workflowRuns == null) {
    throw new Error(
      `Missing data: ${JSON.stringify(data)} ${JSON.stringify(
        workflow,
      )} ${search} ${orderBy} ${orderDir} ${JSON.stringify(
        filters,
      )} ${JSON.stringify(props)}}`,
    );
  }

  return data.workflowRuns.filter(isNotNullish).map((run): WorkflowRunRow => {
    const sequencingReadId = run.entityInputs.edges[0]?.node.inputEntityId;
    if (sequencingReadId == null) {
      throw new Error(`Couldn't find an entity input: ${JSON.stringify(run)}`);
    }
    return {
      id: Number(run.id), // TODO: Make IDs strings
      createdAt: run.startedAt ?? undefined,
      status: run.status != null ? toLower(run.status) : undefined,
      workflow: "consensus-genome", // TODO: Get this from the correct field in NextGen
      wdl_version:
        run.workflowVersion?.version != null
          ? formatSemanticVersion(run.workflowVersion.version)
          : undefined,
      creation_source: run.workflowVersion?.workflow?.name ?? undefined,
      inputSequencingReadId: sequencingReadId,
    };
  });
}

async function querySequencingReadsByIds(
  offset: number,
  filteredIds: string[],
  { projectId, search, orderBy, orderDir, filters }: Partial<Conditions>,
  props: DiscoveryViewProps,
  environment: RelayModernEnvironment,
): Promise<Array<CgEntityRow & Metadata>> {
  // TODO: Do not include argument fields that are null/empty arrays. NextGen will interpret them
  // as return nothing.
  const data = await fetchQuery<DiscoveryViewFCSequencingReadsQueryType>(
    environment,
    DiscoveryViewFCSequencingReadsQuery,
    {
      input: {
        limit: 50,
        offset,
        where: {
          id: {
            _in: filteredIds,
          },
        },
        todoRemove: {
          domain: props.domain,
          projectId: projectId?.toString(),
          search: search,
          host: filters?.host,
          locationV2: filters?.locationV2,
          taxons: filters?.taxon,
          taxaLevels: filters?.taxaLevels,
          time: filters?.time,
          tissue: filters?.tissue,
          visibility: filters?.visibility,
          orderBy,
          orderDir,
          workflow: WorkflowType.CONSENSUS_GENOME,
        },
      },
    },
  ).toPromise();
  if (data?.sequencingReads == null) {
    throw new Error(
      `Missing CG data: ${search} ${orderBy} ${orderDir} ${JSON.stringify(
        filters,
      )} ${JSON.stringify(props)}}`,
    );
  }

  return data.sequencingReads.filter(isNotNullish).flatMap(sequencingRead => {
    const sample = sequencingRead.sample;
    if (sample == null) {
      throw new Error(
        `Sequencing read's sample was nullish: ${JSON.stringify(
          sequencingRead,
        )}`,
      );
    }

    const rows: Array<CgEntityRow & Metadata> = [];

    const sequencingReadAndSampleFields: CgEntityRow = {
      sequencingReadId: sequencingRead.id,
      sample: {
        // TODO: Use NextGen ID when samples are no longer dual-written.
        id: sample.railsSampleId != null ? Number(sample.railsSampleId) : 0,
        railsSampleId: sample.railsSampleId ?? undefined,
        name: sample.name,
        project: sample.collection?.name ?? undefined,
        publicAccess: sample.collection?.public ?? undefined,
        uploadError: sample.uploadError ?? undefined,
        userId: sample.ownerUserId ?? undefined,
        // TODO: Make a separate query to Rails to get usernames from WorkflowRun ownerUserIds,
        // which are currently not being read.
        userNameWhoInitiatedWorkflowRun: sample.ownerUserName ?? undefined,
      },
      host: sample.hostOrganism?.name,
      notes: sample.notes ?? undefined,
      medakaModel: sequencingRead.medakaModel ?? undefined,
      technology: sequencingRead.technology,
      wetlabProtocol:
        sequencingRead.protocol != null
          ? formatWetlabProtocol(sequencingRead.protocol)
          : undefined,
      collection_location_v2: sample.collectionLocation ?? undefined,
      nucleotide_type: sequencingRead.nucleicAcid,
      sample_type: sample.sampleType ?? undefined,
      water_control:
        sample.waterControl != null
          ? sample.waterControl
            ? "Yes"
            : "No"
          : undefined,
    };
    const metadataFields = Object.fromEntries(
      sample.metadatas.edges
        .filter(isNotNullish)
        .map(edge => [edge.node.fieldName, edge.node.value]),
    );
    rows.push({
      ...sequencingReadAndSampleFields,
      ...metadataFields,
    });

    for (const consensusGenomeEdge of sequencingRead.consensusGenomes.edges) {
      if (consensusGenomeEdge == null) {
        continue;
      }
      const node = consensusGenomeEdge.node;
      const metrics = node.metrics;
      rows.push({
        ...sequencingReadAndSampleFields,
        ...metadataFields,
        consensusGenomeProducingRunId: node.producingRunId ?? undefined,
        referenceAccession: {
          accessionName: node.referenceGenome?.accessionName ?? undefined,
          referenceAccessionId: node.referenceGenome?.accessionId ?? undefined,
          taxonName:
            sequencingRead.taxon?.name ?? node.taxon?.name ?? undefined,
        },
        coverageDepth: metrics?.coverageDepth ?? undefined,
        totalReadsCG: metrics?.totalReads ?? undefined,
        gcPercent: metrics?.gcPercent ?? undefined,
        refSnps: metrics?.refSnps ?? undefined,
        percentIdentity: metrics?.percentIdentity ?? undefined,
        nActg: metrics?.nActg ?? undefined,
        percentGenomeCalled: metrics?.percentGenomeCalled ?? undefined,
        nMissing: metrics?.nMissing ?? undefined,
        nAmbiguous: metrics?.nAmbiguous ?? undefined,
        referenceAccessionLength: metrics?.referenceGenomeLength ?? undefined,
      });
    }

    return rows;
  });
}

/**
 *  _____  _                                __      ___
 * |  __ \(_)                               \ \    / (_)
 * | |  | |_ ___  ___ _____   _____ _ __ _   \ \  / / _  _____      __
 * | |  | | / __|/ __/ _ \ \ / / _ \ '__| | | \ \/ / | |/ _ \ \ /\ / /
 * | |__| | \__ \ (_| (_) \ V /  __/ |  | |_| |\  /  | |  __/\ V  V /
 * |_____/|_|___/\___\___/ \_/ \___|_|   \__, | \/   |_|\___| \_/\_/
 *                                        __/ |
 *                                       |___/
 *
 * Functional wrapper (for Relay and other hooks) that performs all GQL fetching for
 * <DiscoveryView>, which contains most state.
 */
export const DiscoveryViewFC = (props: DiscoveryViewProps) => {
  const { admin, allowedFeatures } = useContext(UserContext);
  const globalContext = useContext(GlobalContext);
  const environment = useRelayEnvironment();

  // RELAY HOOKS:
  // TODO(bchu): Use useQueryLoader() here for parallel queries like aggregation, stats, etc. that
  // shouldn't block the entire page:

  // REFS:
  const workflowRunsPromise = useRef<Promise<WorkflowRunRow[]>>(
    Promise.resolve([]),
  );
  const cgFirstPagePromise = useRef<
    Promise<Array<CgRow | undefined>> | undefined
  >();
  const cgConditions = useRef<Partial<Conditions>>({}); // TODO: Delete when no longer using Rails

  // STATE:
  const [cgWorkflowRunIds, setCgWorkflowRunIds] = useState<
    number[] | undefined // TODO: Make IDs strings
  >();
  const [cgFullRows, setCgFullRows] = useState<Array<CgRow | undefined>>([]);

  const updateDiscoveryProjectId = (projectId: number | null) => {
    globalContext?.globalContextDispatch(
      createAction(ActionType.UPDATE_DISCOVERY_PROJECT_IDS, projectId),
    );
  };

  const reset = () => {
    // TODO: dispose() stale queryReferences.
    cgFirstPagePromise.current = undefined;
    cgConditions.current = {};
    setCgWorkflowRunIds(undefined);
    setCgFullRows([]);
  };

  const fetchCgFilteredWorkflowRuns = async (
    conditions: Conditions,
  ): Promise<void> => {
    reset();
    // TODO: Conditionally query project IDs.
    // TODO: Add the rest of the workflows.
    cgConditions.current = conditions;
    try {
      workflowRunsPromise.current = queryWorkflowRuns(
        WorkflowType.CONSENSUS_GENOME,
        conditions,
        props,
        environment,
      );
      const workflowRuns = await workflowRunsPromise.current;
      setCgWorkflowRunIds(workflowRuns.map(run => run.id));
      fetchCgPage(/* offset */ 0);
      // TODO: Query aggregates, stats, etc.
    } catch (error) {
      logError({
        message: "[DiscoveryViewError] fetchCgFilteredWorkflowRuns() failed",
        details: { error },
      });
    }
  };

  const fetchCgPage = async (
    offset: number,
  ): Promise<Array<CgRow | undefined>> => {
    if (offset === 0) {
      if (cgFirstPagePromise.current !== undefined) {
        return cgFirstPagePromise.current;
      } else {
        cgFirstPagePromise.current = doFetchCgPage(offset);
        return cgFirstPagePromise.current;
      }
    }
    return doFetchCgPage(offset);
  };

  const doFetchCgPage = async (
    offset: number,
  ): Promise<Array<CgRow | undefined>> => {
    // TODO: Await projects query first.
    const workflowRuns = await workflowRunsPromise.current;
    const sequencingReads = await querySequencingReadsByIds(
      offset, // TODO: Remove.
      // TODO: Make IDs strings
      workflowRuns.slice(offset, offset + 50).map(run => run.id.toString()),
      cgConditions.current,
      props,
      environment,
    );
    const newRows: Array<CgRow | undefined> = [];
    for (let i = offset; i < Math.min(offset + 50, workflowRuns.length); i++) {
      const run = workflowRuns[i];
      const sequencingReadRows = sequencingReads.filter(
        sequencingRead =>
          sequencingRead.sequencingReadId === run.inputSequencingReadId,
      );
      const matchingSequencingRead =
        sequencingReadRows?.find(
          row => row.consensusGenomeProducingRunId === run.id.toString(), // TODO: Make IDs strings
        ) ??
        sequencingReadRows?.find(
          row => row.consensusGenomeProducingRunId === undefined,
        );
      newRows.push(
        matchingSequencingRead !== undefined
          ? {
              ...run,
              ...matchingSequencingRead,
            }
          : undefined,
      );
    }
    setCgFullRows(prevFullCgRows => prevFullCgRows.concat(newRows));
    return newRows;
  };

  return (
    <DiscoveryView
      {...props}
      allowedFeatures={allowedFeatures}
      isAdmin={admin}
      updateDiscoveryProjectId={updateDiscoveryProjectId}
      /* NextGen props: */
      cgWorkflowIds={cgWorkflowRunIds}
      cgRows={cgFullRows}
      fetchCgWorkflowRuns={fetchCgFilteredWorkflowRuns}
      fetchCgPage={fetchCgPage}
    />
  );
};