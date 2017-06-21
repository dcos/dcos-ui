import classNames from "classnames";
import mixin from "reactjs-mixin";
import { Modal } from "reactjs-components";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import { Hooks } from "PluginSDK";

import ModalHeading from "./modals/ModalHeading";

const METHODS_TO_BIND = ["handleModalClose", "handleServerError"];

function getEventsFromStoreListeners(storeListeners) {
  const events = [];

  storeListeners.forEach(store => {
    store.events.forEach(storeEvent => {
      events.push(this.store_getChangeFunctionName(store.name, storeEvent));
    });
  });

  return events;
}

module.exports = class ServerErrorModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      isOpen: false,
      errors: []
    };

    this.store_listeners = Hooks.applyFilter("serverErrorModalListeners", []);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    const events = getEventsFromStoreListeners.call(this, this.store_listeners);
    events.forEach(event => {
      this[event] = this.handleServerError;
    });
  }

  handleModalClose() {
    this.setState({
      isOpen: false,
      errors: []
    });
  }

  handleServerError(errorMessage) {
    if (!errorMessage) {
      throw "No error message defined!";
    }

    const isLocked = errorMessage && /force=true/.test(errorMessage);

    const errors = this.state.errors.concat([errorMessage]);

    this.setState({
      errors,
      isOpen: !isLocked
    });
  }

  getFooter() {
    return (
      <div className="button-collection text-align-center flush-bottom">
        <div className="button" onClick={this.handleModalClose}>
          Close
        </div>
      </div>
    );
  }

  getContent() {
    const { errors } = this.state;
    const lastErrorIndex = errors.length - 1;
    const errorMessages = errors.map(function(error, index) {
      const errorMessageClass = classNames("text-align-center", {
        // Last error message doesn't have margin bottom.
        "flush-bottom": index === lastErrorIndex
      });

      return (
        <p className={errorMessageClass} key={index}>
          {error}
        </p>
      );
    });

    return (
      <div className="pod pod-short flush-right flush-left">
        {errorMessages}
      </div>
    );
  }

  render() {
    const header = (
      <ModalHeading level={5}>
        An error has occurred
      </ModalHeading>
    );

    return (
      <Modal
        modalWrapperClass="server-error-modal"
        modalClass="modal"
        onClose={this.handleModalClose}
        open={this.state.isOpen}
        showHeader={true}
        showFooter={true}
        footer={this.getFooter()}
        header={header}
      >
        {this.getContent()}
      </Modal>
    );
  }
};
