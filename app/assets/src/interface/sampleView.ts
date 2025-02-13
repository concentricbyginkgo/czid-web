import { ThresholdConditions } from "~/components/utils/ThresholdMap";
import { WorkflowLabelType } from "~/components/utils/workflows";
import { ReportMetadata } from "~/interface/reportMetaData";
import {
  ConsensusGenomeData,
  DateString,
  SampleId,
  Taxon,
} from "~/interface/shared";

export interface SampleViewProps {
  sampleId?: number;
  snapshotShareId?: string;
}

export type CurrentTabSample = WorkflowLabelType;
export interface AmrDeprectatedData {
  allele: string;
  annotation_gene?: $TSFixMeUnknown;
  coverage: number;
  created_at: DateString;
  depth: number;
  dpm: number;
  drug_family: string;
  genbank_accession: null;
  gene: string;
  gene_family: string;
  id: number;
  pipeline_run_id: number;
  rpm: number;
  total_reads: number;
  updated_at: DateString;
}

export interface Lineage {
  name: string;
  parent: number;
  rank: "kingdom" | "phylum" | "class" | "order" | "family" | "genus";
}

export interface BlastData {
  context: { blastedFrom: string };
  pipelineVersion: string;
  sampleId: SampleId;
  taxName: string;
  taxId: number;
  taxLevel?: number;
  shouldBlastContigs?: boolean;
  taxonStatsByCountType: {
    ntContigs: number;
    ntReads: number;
    nrContigs: number;
    nrReads: number;
  };
}

export interface ConsensusGenomeParams {
  accessionId: string;
  accessionName: string;
  taxonId: number | null;
  taxonName: string;
}

export interface FilterSelections {
  annotations: string[];
  flags: string[];
  thresholdsShortReads: ThresholdConditions[];
  thresholdsLongReads: ThresholdConditions[];
  taxa: { id: number; name: string; level: "genus" | "species" }[];
  metricShortReads: string;
  metricLongReads: string;
  readSpecificity: number;
  background: number | null;
  nameType: string;
  categories:
    | { categories: string[]; subcategories: { Viruses: string[] } }
    | Record<string, never>;
}

export type SampleReportViewMode = "table" | "tree";

export interface RawReportData {
  all_tax_ids: number[];
  counts: {
    [key: number]: {
      [id: number]: Taxon;
    };
  };
  highlightedTaxIds: number[];
  lineage: {
    [id: string]: Lineage;
  };
  metadata: ReportMetadata;
  sortedGenus: number[];
}

export type CellRendererType = ({
  cellData,
  rowData,
}: {
  cellData?: Array<number> | number | string;
  rowData?: Taxon;
}) => JSX.Element | string | null;

export type HeaderRendererType = () => JSX.Element;

export interface ColumnProps {
  dataKey: string;
  sortKey?: string;
  cellRenderer?: CellRendererType;
  className?: string;
  columnData?: { [key: string]: any };
  disableSort?: boolean;
  disableDrag?: boolean;
  flexGrow?: number;
  headerClassName?: string;
  headerRenderer?: HeaderRendererType;
  label?: string;
  minWidth?: number;
  width?: number;
  sortFunction?: ({ data, sortDirection }: SortFunctionsParams) => Taxon[];
  cellDataGetter?: ({ rowData }: { rowData: Taxon }) => (string | number)[];
}

export interface SortFunctionsParams {
  data: Taxon[];
  sortDirection: "asc" | "desc";
}

export type ConsensusGenomeClick = Required<
  Pick<ConsensusGenomeData, "percentIdentity" | "taxId" | "taxName">
>;

export type DBType = "nt" | "nr";

export interface BenchmarkWorkflowRunAdditionalInfo {
  [key: number]: BenchmarkWorkflowRunAdditionalInfoEntry;
}

export interface BenchmarkWorkflowRunAdditionalInfoEntry {
  sampleName: string;
  isRef: boolean;
  runId: number;
  pipelineVersion: string;
  ncbiIndexVersion: string;
}

export interface ModalsVisible {
  consensusGenomeError: boolean;
  consensusGenomeCreation: boolean;
  consensusGenomePrevious: boolean;
  blastSelection: boolean;
  blastContigs: boolean;
  blastReads: boolean;
}
