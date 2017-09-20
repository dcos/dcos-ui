import React from "react";
import { Modal } from "reactjs-components";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

const GroupContainsFrameworksModal = props => {
  const modalFooter = (
    <div className="text-align-center">
      <button className="button button-medium" onClick={props.onClose}>
        OK
      </button>
    </div>
  );

  const modalHeading = (
    <ModalHeading className="text-danger">
      Delete Group
    </ModalHeading>
  );

  return (
    <Modal
      modalClass="modal"
      footer={modalFooter}
      header={modalHeading}
      onClose={props.onClose}
      open={props.isOpen}
      showFooter={true}
      showHeader={true}
    >
      <div className="modal-service-delete-center">
        This group needs to be empty to delete it. Please delete any services in the group first.
      </div>
    </Modal>
  );
};

export default GroupContainsFrameworksModal;
