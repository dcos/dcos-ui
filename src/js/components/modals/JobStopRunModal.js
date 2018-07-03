import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
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

    return <span key="confirmText">You are about to stop {bodyText}.</span>;
  }

  render() {
    const { onClose, open, selectedItems } = this.props;
    const selectedItemsLength = selectedItems.length;
    let rightButtonText = "Stop Job Run";

    if (selectedItemsLength > 1) {
      rightButtonText = "Stop Job Runs";
    }

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={this.state.pendingRequest}
        header={this.getContentHeader(selectedItems, selectedItemsLength)}
        open={open}
        onClose={onClose}
        leftButtonText="Cancel"
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link"
        rightButtonText={rightButtonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleButtonConfirm}
        showHeader={true}
      >
        <div className="text-align-center">
          {this.getConfirmTextBody(selectedItems, selectedItemsLength)}
        </div>
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
  selectedItems: PropTypes.array.isRequired
};

module.exports = JobStopRunModal;
