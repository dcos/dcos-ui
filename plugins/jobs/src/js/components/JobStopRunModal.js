import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

class JobStopRunModal extends React.Component {
  getContentHeader(selectedItems, selectedItemsLength) {
    let headerContent = ` ${selectedItemsLength} Job Runs`;
    if (selectedItemsLength === 1) {
      headerContent = "this";
    }

    return (
      <ModalHeading key="confirmHeader">
        {`Are you sure you want to stop ${headerContent}?`}
      </ModalHeading>
    );
  }

  getConfirmTextBody(selectedItems, selectedItemsLength) {
    let bodyText;

    if (selectedItemsLength === 1) {
      bodyText = `the job run with id ${selectedItems[0]}`;
    } else {
      bodyText = "the selected job runs";
    }

    return <span key="confirmText">You are about to stop {bodyText}.</span>;
  }

  getModalContents() {
    const { selectedItems } = this.props;
    const selectedItemsLength = selectedItems.length;

    return (
      <div className="text-align-center">
        {this.getConfirmTextBody(selectedItems, selectedItemsLength)}
      </div>
    );
  }

  render() {
    const { onClose, open, selectedItems } = this.props;
    let rightButtonText = "Stop Job Run";
    const selectedItemsLength = selectedItems.length;

    if (selectedItems.length > 1) {
      rightButtonText = "Stop Job Runs";
    }

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={this.props.disabled}
        header={this.getContentHeader(selectedItems, selectedItemsLength)}
        open={open}
        onClose={onClose}
        leftButtonText="Cancel"
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link"
        rightButtonText={rightButtonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.props.onSuccess}
        showHeader={true}
      >
        {this.getModalContents()}
      </Confirm>
    );
  }
}

JobStopRunModal.defaultProps = {
  onSuccess() {}
};

JobStopRunModal.propTypes = {
  jobID: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};

module.exports = JobStopRunModal;
