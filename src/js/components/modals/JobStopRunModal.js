import { Trans } from "@lingui/macro";
import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import React from "react";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import ModalHeading from "../modals/ModalHeading";

import * as MetronomeClient from "../../events/MetronomeClient";

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
    const { selectedItem, jobID } = this.props;
    const jobRunID = selectedItem;

    if (jobID == null || jobRunID == null) {
      return;
    }

    MetronomeClient.stopJobRun(jobID, jobRunID).subscribe();

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

  render() {
    const { onClose } = this.props;

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={this.state.pendingRequest}
        header={
          <ModalHeading key="confirmHeader">
            <Trans render="span">Are you sure you want to stop this?</Trans>
          </ModalHeading>
        }
        open={open}
        onClose={onClose}
        leftButtonText={<Trans id="Cancel" />}
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link"
        rightButtonText={
          this.state.pendingRequest ? (
            <Trans id="Stopping..." />
          ) : (
            <Trans id="Stop Job Run" />
          )
        }
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleButtonConfirm}
        showHeader={true}
      >
        <div className="text-align-center">
          <Trans render="span">
            You are about to stop the job run with id {this.props.selectedItem}.
          </Trans>
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
  selectedItem: PropTypes.string.isRequired
};

export default JobStopRunModal;
