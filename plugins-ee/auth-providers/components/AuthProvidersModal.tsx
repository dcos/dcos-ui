import { Trans } from "@lingui/macro";
import { Modal } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";

import AuthProvider from "../structs/AuthProvider";
import AuthProvidersModalButtonContents from "./AuthProvidersModalButtonContents";
import AuthProvidersModalForm from "./AuthProvidersModalForm";

class AuthProvidersModal extends React.Component {
  constructor(...args) {
    super(...args);

    this.triggerFormSubmit = () => {};

    this.state = {
      selectedProviderType: null
    };
  }
  handleIdentitySelection = selectedProviderType => {
    this.setState({ selectedProviderType });
  };
  onClose = () => {
    this.resetModalState();
    this.props.onClose();
  };
  onError = () => {
    this.forceUpdate();
  };
  onSubmit = () => {
    this.triggerFormSubmit();
    this.forceUpdate();
  };
  getTriggerSubmit = trigger => {
    this.triggerFormSubmit = trigger;
  };
  resetModalState = () => {
    this.setState({
      selectedProviderType: null
    });
  };

  getModalButtons() {
    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">
        {this.getModalButtonLeft()}
        <button className="button button-primary" onClick={this.onSubmit}>
          <Trans render="span">Add Provider</Trans>
        </button>
      </div>
    );
  }

  getModalButtonLeft() {
    if (this.props.provider instanceof AuthProvider) {
      // Edit Mode
      return (
        <Trans
          render={
            <button
              className="button button-primary-link flush-left"
              onClick={this.onClose}
            />
          }
        >
          Cancel
        </Trans>
      );
    }

    // New Identity Provider Mode
    return (
      <Trans
        render={
          <button
            className="button button-primary-link flush-left"
            onClick={this.resetModalState}
          />
        }
      >
        Back
      </Trans>
    );
  }

  getProviderButtonsFooter() {
    return (
      <div className="text-align-center">
        <Trans
          render={
            <button
              className="button button-primary-link"
              onClick={this.onClose}
            />
          }
        >
          Close
        </Trans>
      </div>
    );
  }

  render() {
    const { open, provider } = this.props;
    const { selectedProviderType } = this.state;
    const showForm = selectedProviderType || provider instanceof AuthProvider;

    return (
      <div>
        <Modal
          footer={this.getProviderButtonsFooter()}
          modalClass="modal modal-small"
          onClose={this.onClose}
          open={open && !showForm}
          showFooter={true}
          transitionAppear={false}
          header={
            <ModalHeading>
              <Trans render="span">Add Identity Provider</Trans>
            </ModalHeading>
          }
          showHeader={true}
        >
          <AuthProvidersModalButtonContents
            onClick={this.handleIdentitySelection}
          />
        </Modal>
        <AuthProvidersModalForm
          footer={this.getModalButtons()}
          onClose={this.onClose}
          onError={this.onError}
          open={!!(open && showForm)}
          provider={provider}
          providerType={selectedProviderType}
          triggerSubmit={this.getTriggerSubmit}
        />
      </div>
    );
  }
}

AuthProvidersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  open: PropTypes.bool.isRequired,
  provider: PropTypes.instanceOf(AuthProvider)
};

export default AuthProvidersModal;
