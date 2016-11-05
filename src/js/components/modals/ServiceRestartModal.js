import {Confirm} from 'reactjs-components';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import MarathonStore from '../../stores/MarathonStore';
import ServiceActionModal from './ServiceActionModal';

class ServiceRestartModal extends ServiceActionModal {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceRestartError',
          'serviceRestartSuccess'
        ],
        suppressUpdate: true
      }
    ];

    this.onMarathonStoreServiceRestartSuccess = this.closeDialog;
  }

  onMarathonStoreServiceRestartError({message:errorMsg = '', details}) {
    let hasDetails = details && details.length !== 0;

    if (hasDetails) {
      this.setState({
        errorMsg: details.reduce(function (memo, error) {
          if (error != null && Array.isArray(error.errors)) {
            return `${memo} ${error.errors.join(' ')}`;
          }
        }, '')
      });

      return;
    }

    this.onError(errorMsg);
  }

  handleConfirmClick() {
    super.handleConfirmClick();

    let {service} = this.props;
    let forceUpdate = this.shouldForceUpdate(this.state.errorMsg);

    MarathonStore.restartService(service, forceUpdate);
  }

  render() {
    const {open, service} = this.props;
    let serviceName = '';

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={this.state.disabled}
        open={open}
        onClose={this.handleCloseClick}
        leftButtonCallback={this.handleCloseClick}
        rightButtonText="Restart Service"
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleConfirmClick}>
        <div className="container-pod flush-top container-pod-short-bottom">
          <h2 className="text-align-center flush-top">
            Restart Service
          </h2>
          <p>
            Are you sure you want to restart <span className="emphasize">{serviceName}</span>?
          </p>
          {this.getErrorMessage()}
        </div>
      </Confirm>
    );
  }
}

module.exports = ServiceRestartModal;
