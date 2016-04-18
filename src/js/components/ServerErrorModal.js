import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import {Hooks} from 'PluginSDK';

const METHODS_TO_BIND = ['handleModalClose', 'handleServerError'];

function getEventsFromStoreListeners(storeListeners) {
  let events = [];

  storeListeners.forEach((store) => {
    store.events.forEach((storeEvent) => {
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

    this.store_listeners = Hooks.applyFilter('serverErrorModalListeners', []);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    let events = getEventsFromStoreListeners.call(this, this.store_listeners);
    events.forEach((event) => {
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
      throw 'No error message defined!';
    }

    let errors = this.state.errors.concat([errorMessage]);

    this.setState({
      errors,
      isOpen: true
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
    let {errors} = this.state;
    let errorMessages = this.state.errors.map(function (error, i) {
      let errorMessageClass = classNames('text-align-center', {
        // Last error message doesn't have margin bottom.
        'flush-bottom': i === errors.length - 1
      });

      return (
        <p className={errorMessageClass} key={i}>
          {error}
        </p>
      );
    });

    return (
      <div className="container container-pod container-pod-short">
        {errorMessages}
      </div>
    );
  }

  render() {
    return (
      <Modal
        modalWrapperClass="modal-generic-error"
        modalClass="modal"
        maxHeightPercentage={0.9}
        onClose={this.handleModalClose}
        open={this.state.isOpen}
        showCloseButton={false}
        showHeader={true}
        showFooter={true}
        footer={this.getFooter()}
        titleClass="modal-header-title text-align-center flush"
        titleText="An error has occurred">
        {this.getContent()}
      </Modal>
    );
  }
};
