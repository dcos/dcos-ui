import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
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

  getContentHeader() {
    return (
      <ModalHeading key="confirmHeader">
        <Trans render="span">Are you sure you want to stop this?</Trans>
      </ModalHeading>
    );
  }

  getConfirmTextBody(selectedItem) {
    const bodyText =
      i18nMark("You are about to stop the job run with id") +
      ` ${selectedItem}.`;

    return <Trans render="span" id={bodyText} />;
  }

  getModalContents() {
    const { selectedItem } = this.props;

    return (
      <div className="text-align-center">
        {this.getConfirmTextBody(selectedItem)}
      </div>
    );
  }

  render() {
    const { onClose, open, i18n } = this.props;
    // L10NTODO: Pluralize
    const affirmText = i18n._(t`Stop Job Run`);
    const rightButtonText = this.state.pendingRequest
      ? i18n._(t`Stopping...`)
      : affirmText;

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={this.state.pendingRequest}
        header={this.getContentHeader()}
        open={open}
        onClose={onClose}
        leftButtonText={i18n._(t`Cancel`)}
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link"
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
  jobID: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  selectedItem: PropTypes.string.isRequired
};

export default withI18n()(JobStopRunModal);
