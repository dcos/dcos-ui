import React from "react";
import { Modal } from "reactjs-components";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

const getServices = function(services) {
  if (services && services.length > 0) {
    return services
      .map(service => {
        return service.getId();
      })
      .join(", ");
  }

  return;
};

const GroupContainsFrameworksModal = props => {
  const modalFooter = (
    <div className="text-align-center">
      <button
        className="button button-primary button-medium"
        onClick={props.onClose}
      >
        Close
      </button>
    </div>
  );

  const modalHeading = (
    <ModalHeading className="text-danger">
      Group Delete
    </ModalHeading>
  );

  const pluralEnding = props.services && props.services.length > 1 ? "s" : "";

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
      Must delete
      {" "}
      <b>{getServices(props.services)}</b>
      {" "}
      service
      {pluralEnding}
      {" "}
      before destroying the group
    </Modal>
  );
};

export default GroupContainsFrameworksModal;
