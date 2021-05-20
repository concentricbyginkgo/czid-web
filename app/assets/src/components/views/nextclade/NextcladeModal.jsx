import cx from "classnames";
import {
  compact,
  difference,
  filter,
  keys,
  map,
  size,
  uniq,
  values,
} from "lodash/fp";
import PropTypes from "prop-types";
import React from "react";

import { createConsensusGenomeCladeExport } from "~/api";
import { validateSampleIds } from "~/api/access_control";
import { logAnalyticsEvent, ANALYTICS_EVENT_NAMES } from "~/api/analytics";
import { UserContext } from "~/components/common/UserContext";
import List from "~/components/ui/List";
import ErrorModal from "~/components/ui/containers/ErrorModal";
import { IconInfoSmall } from "~/components/ui/icons";
import {
  NEXTCLADE_APP_LINK,
  NEXTCLADE_REFERENCE_TREE_LINK,
} from "~/components/utils/documentationLinks";
import { SARS_COV_2 } from "~/components/views/samples/SamplesView/constants";
import ColumnHeaderTooltip from "~ui/containers/ColumnHeaderTooltip";
import Modal from "~ui/containers/Modal";
import { openUrlInNewTab } from "~utils/links";
import { WORKFLOWS } from "~utils/workflows";
import NextcladeConfirmationModal from "./NextcladeConfirmationModal";
import NextcladeModalFooter from "./NextcladeModalFooter";
import NextcladeReferenceTreeOptions from "./NextcladeReferenceTreeOptions";

import cs from "./nextclade_modal.scss";

export default class NextcladeModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmationModalOpen: false,
      errorModalOpen: false,
      invalidSampleNames: [],
      loading: true,
      loadingResults: false,
      nonSarsCov2SampleNames: [],
      projectIds: [],
      referenceTree: null,
      selectedTreeType: "global",
      validationError: null,
      validSampleIds: new Set(),
    };
  }

  componentDidMount() {
    const { samples } = this.props;
    const { admin } = this.context || {};

    this.fetchSampleValidationInfo(keys(samples).map(Number));

    if (admin) this.checkAdminSelections();
  }

  fetchSampleValidationInfo = async selectedSampleIds => {
    const { samples } = this.props;

    const {
      validSampleIds,
      invalidSampleNames,
      error,
    } = await validateSampleIds(
      selectedSampleIds,
      WORKFLOWS.CONSENSUS_GENOME.value
    );

    const validSamples = filter(
      s => validSampleIds.includes(s.id),
      values(samples)
    );

    const projectIds = map("projectId", validSamples);

    const nonSarsCov2SampleNames = values(validSamples)
      .filter(sample => sample.referenceGenome.taxonName !== SARS_COV_2)
      .map(sample => sample.sample.name);

    this.setState({
      validSampleIds: new Set(validSampleIds),
      invalidSampleNames,
      loading: false,
      nonSarsCov2SampleNames,
      validationError: error,
      projectIds: projectIds,
    });
  };

  checkAdminSelections = async () => {
    const { userId } = this.context || {};
    const { samples } = this.props;

    const selectedOwnerIds = compact(
      uniq(map("sample.userId", values(samples)))
    );
    if (difference(selectedOwnerIds, [userId]).length) {
      window.alert(
        "Admin warning: You have selected samples that belong to other users. Double-check that you have permission to send to Nextclade for production samples."
      );
    }
  };

  openExportLink = async () => {
    const {
      validSampleIds,
      referenceTreeContents,
      selectedTreeType,
    } = this.state;
    const link = await createConsensusGenomeCladeExport({
      sampleIds: Array.from(validSampleIds),
      referenceTree:
        selectedTreeType === "upload" ? referenceTreeContents : null,
    });
    openUrlInNewTab(link.external_url);
  };

  handleFileUpload = async file => {
    const fileContents = await this.readUploadedFile(file);
    this.setState({
      referenceTree: file,
      referenceTreeContents: fileContents,
    });
  };

  readUploadedFile = inputFile => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(reader.error);
      };

      reader.onload = () => {
        // stringify-parse to remove excess whitespace
        resolve(JSON.stringify(JSON.parse(reader.result)));
      };
      reader.readAsText(inputFile);
    });
  };

  handleSelectTreeType = selectedTreeType => {
    this.setState({
      selectedTreeType,
    });
  };

  renderTooltip = ({
    content,
    link,
    iconStyle = null,
    offset = [0, 0],
    position = "top center",
  }) => {
    return (
      <ColumnHeaderTooltip
        trigger={
          <IconInfoSmall className={cx(cs.infoIcon, iconStyle && iconStyle)} />
        }
        content={content}
        link={link}
        offset={offset}
        position={position}
      />
    );
  };

  handleConfirmationModalOpen = () => {
    this.setState({ confirmationModalOpen: true });
  };

  handleConfirmationModalClose = () => {
    const { projectIds, validSampleIds, selectedTreeType } = this.state;

    logAnalyticsEvent(
      ANALYTICS_EVENT_NAMES.NEXTCLADE_MODAL_CONFIRMATION_MODAL_CANCEL_BUTTON_CLICKED,
      {
        sampleIds: Array.from(validSampleIds),
        selectedTreeType,
        projectIds,
      }
    );

    this.setState({ confirmationModalOpen: false });
  };

  handleConfirmationModalConfirm = async () => {
    const { onClose } = this.props;
    const { projectIds, validSampleIds, selectedTreeType } = this.state;

    const sampleIds = Array.from(validSampleIds);

    try {
      this.setState({ loadingResults: true }, () => {
        logAnalyticsEvent(
          ANALYTICS_EVENT_NAMES.NEXTCLADE_MODAL_CONFIRMATION_MODAL_CONFIRM_BUTTON_CLICKED,
          {
            sampleIds,
            selectedTreeType,
            projectIds,
          }
        );
      });

      await this.openExportLink();
      this.setState({ confirmationModalOpen: false }, () => {
        onClose();
      });
    } catch (error) {
      this.setState(
        {
          confirmationModalOpen: false,
          errorModalOpen: true,
          loadingResults: false,
        },
        () => {
          console.error(error);
          logAnalyticsEvent(
            ANALYTICS_EVENT_NAMES.NEXTCLADE_MODAL_UPLOAD_FAILED,
            {
              error,
              sampleIds,
              selectedTreeType,
              projectIds,
            }
          );
        }
      );
    }
  };

  handleErrorModalRetry = async () => {
    const { onClose } = this.props;
    const { projectIds, validSampleIds, selectedTreeType } = this.state;

    const sampleIds = Array.from(validSampleIds);

    try {
      await this.openExportLink();
      this.setState({ errorModalOpen: false }, () => {
        onClose();
        logAnalyticsEvent(
          ANALYTICS_EVENT_NAMES.NEXTCLADE_MODAL_CONFIRMATION_MODAL_RETRY_BUTTON_CLICKED,
          {
            sampleIds,
            selectedTreeType,
            projectIds,
          }
        );
      });
    } catch (error) {
      console.error(error);
      logAnalyticsEvent(
        ANALYTICS_EVENT_NAMES.NEXTCLADE_MODAL_RETRY_UPLOAD_FAILED,
        {
          error,
          sampleIds,
          selectedTreeType,
          projectIds,
        }
      );
    }
  };

  handleErrorModalClose = () => {
    this.setState({ errorModalOpen: false });
  };

  render() {
    const { open, onClose, samples } = this.props;
    const {
      confirmationModalOpen,
      errorModalOpen,
      invalidSampleNames,
      loading,
      loadingResults,
      nonSarsCov2SampleNames,
      referenceTree,
      validationError,
      validSampleIds,
      selectedTreeType,
    } = this.state;

    return (
      <Modal narrow open={open} tall onClose={onClose}>
        <div className={cs.modal}>
          <div className={cs.nextcladeHeader}>
            <div className={cs.title}>
              View Samples in Nextclade
              {this.renderTooltip({
                content:
                  "Nextclade is a third-party tool and has its own policies.",
                link: NEXTCLADE_APP_LINK,
              })}
            </div>
            <div className={cs.tagline}>
              {size(samples)} Sample
              {size(samples) !== 1 ? "s" : ""} selected
            </div>
          </div>
          <div className={cs.nextcladeDescription}>
            <div className={cs.title}> Nextclade helps you: </div>
            <List
              listItems={[
                `Assess sequence quality`,
                `See where your samples differ from the reference sequence`,
                `Identify which clade or lineage your samples belong to`,
                <React.Fragment>
                  View sample placement in the context of a Nextstrain
                  phylogenetic tree
                  {this.renderTooltip({
                    content:
                      "Exercise caution when interpreting this tree. Nextclade’s algorithms are meant for quick assessments and not a replacement for full analysis with the Nextstrain pipeline.",
                    iconStyle: cs.lower,
                    position: "top right",
                    offset: [11, 0],
                  })}
                </React.Fragment>,
              ]}
            />
          </div>
          <div className={cs.referenceTree}>
            <div className={cs.title}>
              Reference Tree
              {this.renderTooltip({
                content:
                  "Nextclade will graft your sequences onto the reference tree to provide more context.",
                link: NEXTCLADE_REFERENCE_TREE_LINK,
                iconStyle: cs.lower,
              })}
            </div>
            <div className={cs.options}>
              <NextcladeReferenceTreeOptions
                referenceTree={referenceTree && referenceTree.name}
                onChange={this.handleFileUpload}
                onSelect={this.handleSelectTreeType}
                selectedType={selectedTreeType}
              />
            </div>
          </div>
          <div className={cs.footer}>
            <NextcladeModalFooter
              onClick={this.handleConfirmationModalOpen}
              invalidSampleNames={invalidSampleNames}
              loading={loading}
              nonSarsCov2SampleNames={nonSarsCov2SampleNames}
              validationError={validationError}
              validSampleIds={validSampleIds}
            />
          </div>
        </div>
        {confirmationModalOpen && (
          <NextcladeConfirmationModal
            open
            onCancel={this.handleConfirmationModalClose}
            onConfirm={this.handleConfirmationModalConfirm}
            loading={loadingResults}
          />
        )}
        {errorModalOpen && (
          <ErrorModal
            helpLinkEvent={
              ANALYTICS_EVENT_NAMES.NEXTCLADE_MODAL_ERROR_MODAL_HELP_LINK_CLICKED
            }
            labelText="Failed to send"
            open
            onCancel={this.handleErrorModalClose}
            onConfirm={this.handleErrorModalRetry}
            title={
              "Sorry! There was an error sending your samples to Nextclade."
            }
          />
        )}
      </Modal>
    );
  }
}

NextcladeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  samples: PropTypes.object.isRequired,
};

NextcladeModal.contextType = UserContext;
