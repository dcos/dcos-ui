import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";
import { Modal } from "reactjs-components";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ClusterLinkingStore from "../stores/ClusterLinkingStore";
import ClusterLinkingModalContent from "./ClusterLinkingModalContent";

const ClusterModalHeading = () => (
  <ModalHeading>
    <Trans render="span">Linked Clusters</Trans>
  </ModalHeading>
);

const ClusterModalFooter = ({ onClose }) => (
  <div className="text-align-center">
    <button className="button button-medium button-primary" onClick={onClose} />
  </div>
);

const ClusterLinkingModal = ({ onClose, open }) => (
  <Modal
    modalClass="modal modal-link-list"
    header={<ClusterModalHeading />}
    footer={<ClusterModalFooter onClose={onClose} />}
    onClose={onClose}
    open={open}
    showFooter={true}
    showHeader={true}
  >
    <ClusterLinkingModalContent
      clusters={ClusterLinkingStore.getLinkedClusters()}
    />
  </Modal>
);

ClusterLinkingModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

export default ClusterLinkingModal;
