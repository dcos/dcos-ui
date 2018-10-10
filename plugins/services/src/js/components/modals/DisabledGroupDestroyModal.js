import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";
import { Modal } from "reactjs-components";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

const DisabledGroupDestroyModal = props => {
  const modalFooter = (
    <div className="text-align-center">
      <button className="button button-primary-link" onClick={props.onClose}>
        <Trans render="span">OK</Trans>
      </button>
    </div>
  );

  const modalHeading = (
    <ModalHeading className="text-danger">
      <Trans render="span">Delete Group</Trans>
    </ModalHeading>
  );

  return (
    <Modal
      modalClass="modal modal-small"
      footer={modalFooter}
      header={modalHeading}
      onClose={props.onClose}
      open={props.isOpen}
      showFooter={true}
      showHeader={true}
    >
      <Trans render="div">
        This group needs to be empty to delete it. Please delete any services in
        the group first.
      </Trans>
    </Modal>
  );
};

DisabledGroupDestroyModal.defaultProps = {
  isOpen: false
};

DisabledGroupDestroyModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default DisabledGroupDestroyModal;
