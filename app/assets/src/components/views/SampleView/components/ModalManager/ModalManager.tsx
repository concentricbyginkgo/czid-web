import React from "react";
import ErrorModal from "~/components/ui/containers/ErrorModal";
import Sample, { WorkflowRun } from "~/interface/sample";
import {
  BlastData,
  ConsensusGenomeClick,
  ConsensusGenomeParams,
  ModalsVisible,
} from "~/interface/sampleView";
import { ConsensusGenomeData } from "~/interface/shared";
import {
  BlastContigsModal,
  BlastReadsModal,
  BlastSelectionModal,
} from "./components/BlastModals";
import { BlastModalInfo } from "./components/BlastModals/constants";
import {
  ConsensusGenomeCreationModal,
  ConsensusGenomePreviousModal,
} from "./components/ConsensusGenomeModals";

interface ModalManagerProps {
  blastData: BlastData | Record<string, never>;
  blastModalInfo: BlastModalInfo;
  consensusGenomeData: ConsensusGenomeData;
  consensusGenomePreviousParams: ConsensusGenomeData;
  handleBlastSelectionModalContinue: (blastModalInfo: BlastModalInfo) => void;
  handleConsensusGenomeClick: (x: ConsensusGenomeClick) => void;
  handleConsensusGenomeErrorModalRetry: () => Promise<void>;
  handleModalAction: (modals: ["open" | "close", string][]) => void;
  handlePreviousConsensusGenomeReportClick: (x: {
    rowData: WorkflowRun;
  }) => void;
  onConsensusGenomeCreation: (x: ConsensusGenomeParams) => Promise<void>;
  modalsVisible: ModalsVisible;
  sample: Sample;
}

export const ModalManager = ({
  blastData,
  blastModalInfo,
  consensusGenomeData,
  consensusGenomePreviousParams,
  handleBlastSelectionModalContinue,
  handleConsensusGenomeClick,
  handleConsensusGenomeErrorModalRetry,
  handleModalAction,
  handlePreviousConsensusGenomeReportClick,
  modalsVisible,
  onConsensusGenomeCreation,
  sample,
}: ModalManagerProps) => {
  // filter out modals that are not visible
  const visibleModals = Object.entries(modalsVisible).filter(
    ([, visible]) => visible,
  );
  return (
    <>
      {visibleModals.map(([modalName]) => {
        switch (modalName) {
          case "blastSelection":
            return (
              <BlastSelectionModal
                key={modalName}
                open={modalsVisible.blastSelection}
                onContinue={handleBlastSelectionModalContinue}
                onClose={() => handleModalAction([["close", "blastSelection"]])}
                taxonName={blastData?.taxName}
                taxonStatsByCountType={blastData?.taxonStatsByCountType}
              />
            );
          case "blastContigs":
            return (
              <BlastContigsModal
                key={modalName}
                open={modalsVisible.blastContigs}
                onClose={() => handleModalAction([["close", "blastContigs"]])}
                blastModalInfo={blastModalInfo}
                context={blastData?.context}
                pipelineVersion={blastData?.pipelineVersion}
                sampleId={blastData?.sampleId}
                taxonName={blastData?.taxName}
                taxonId={blastData?.taxId}
              />
            );
          case "blastReads":
            return (
              <BlastReadsModal
                key={modalName}
                open={modalsVisible.blastReads}
                onClose={() => handleModalAction([["close", "blastReads"]])}
                blastModalInfo={blastModalInfo}
                context={blastData?.context}
                pipelineVersion={blastData?.pipelineVersion}
                sampleId={blastData?.sampleId}
                taxonName={blastData?.taxName}
                // @ts-expect-error CZID-8698 expect strictNullCheck error: error TS2322
                taxonLevel={blastData?.taxLevel}
                taxonId={blastData?.taxId}
              />
            );
          case "consensusGenomeCreation":
            return (
              <ConsensusGenomeCreationModal
                key={modalName}
                consensusGenomeData={consensusGenomeData}
                onClose={() =>
                  handleModalAction([["close", "consensusGenomeCreation"]])
                }
                onCreation={onConsensusGenomeCreation}
                open={modalsVisible.consensusGenomeCreation}
                sample={sample}
              />
            );
          case "consensusGenomePrevious":
            return (
              <ConsensusGenomePreviousModal
                key={modalName}
                consensusGenomeData={consensusGenomePreviousParams}
                onClose={() =>
                  handleModalAction([["close", "consensusGenomePrevious"]])
                }
                onNew={handleConsensusGenomeClick}
                onRowClick={handlePreviousConsensusGenomeReportClick}
                open={modalsVisible.consensusGenomePrevious}
                sample={sample}
              />
            );
          case "consensusGenomeError":
            return (
              <ErrorModal
                key={modalName}
                labelText="Failed"
                open={modalsVisible.consensusGenomeError}
                onCancel={() =>
                  handleModalAction([["close", "consensusGenomeError"]])
                }
                onConfirm={handleConsensusGenomeErrorModalRetry}
                title={
                  "Sorry! There was an error starting your consensus genome run."
                }
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};
