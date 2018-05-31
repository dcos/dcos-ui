import PropTypes from "prop-types";
import React from "react";
import { Modal } from "reactjs-components";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

const DisabledGroupDestroyModal = props => {
  const modalFooter = (
    <div className="text-align-center">
      <button className="button button-primary-link" onClick={props.onClose}>
        OK
      </button>
    </div>
  );

  const modalHeading = (
    <ModalHeading className="text-danger">Delete Group</ModalHeading>
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
      <div>
        This group needs to be empty to delete it. Please delete any services in
        the group first.
      </div>
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
