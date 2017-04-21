import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import MetronomeStore from "../../stores/MetronomeStore";
import ModalHeading from "../modals/ModalHeading";

const METHODS_TO_BIND = ["handleButtonConfirm"];

class JobStopRunModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "metronome",
        events: ["jobStopRunSuccess", "jobStopRunError"],
        suppressUpdate: true
      }
    ];

    this.state = {
      pendingRequest: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleButtonConfirm() {
    const { selectedItems, jobID } = this.props;
    // TODO DCOS-8763 introduce support for multiple job run IDs
    if (selectedItems.length === 1) {
      MetronomeStore.stopJobRun(jobID, selectedItems[0]);
    }

    this.setState({ pendingRequest: true });
  }

  onMetronomeStoreJobStopRunSuccess() {
    this.setState({ pendingRequest: false });
    this.props.onClose();
    this.props.onSuccess();
  }

  onMetronomeStoreJobStopRunError() {
    this.props.onClose();
  }

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

    return (
      <span key="confirmText">
        You are about to stop {bodyText}.
      </span>
    );
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
        disabled={this.state.pendingRequest}
        header={this.getContentHeader(selectedItems, selectedItemsLength)}
        open={open}
        onClose={onClose}
        leftButtonText="Close"
        leftButtonCallback={onClose}
        rightButtonText={rightButtonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleButtonConfirm}
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
  jobID: React.PropTypes.string.isRequired,
  onClose: React.PropTypes.func.isRequired,
  onSuccess: React.PropTypes.func,
  open: React.PropTypes.bool.isRequired,
  selectedItems: React.PropTypes.array.isRequired
};

module.exports = JobStopRunModal;
