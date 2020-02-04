import { Trans } from "@lingui/macro";
import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import ModalHeading from "../modals/ModalHeading";

import * as MetronomeClient from "../../events/MetronomeClient";

export default class JobStopRunModal extends React.Component {
  static propTypes = {
    jobID: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    jobRunID: PropTypes.string.isRequired
  };
  constructor(...args) {
    super(...args);

    this.state = {
      pendingRequest: false
    };

    this.handleButtonConfirm = this.handleButtonConfirm.bind(this);
  }

  handleButtonConfirm() {
    MetronomeClient.stopJobRun(
      this.props.jobID,
      this.props.jobRunID
    ).subscribe();

    this.setState({ pendingRequest: true });
  }

  render() {
    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={this.state.pendingRequest}
        header={
          <ModalHeading key="confirmHeader">
            <Trans render="span">Are you sure you want to stop this?</Trans>
          </ModalHeading>
        }
        open={true}
        onClose={this.props.onClose}
        leftButtonText={<Trans id="Cancel" />}
        leftButtonCallback={this.props.onClose}
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
            You are about to stop the job run with id {this.props.jobRunID}.
          </Trans>
        </div>
      </Confirm>
    );
  }
}
