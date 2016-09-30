import {Confirm} from 'reactjs-components';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import MarathonStore from '../../stores/MarathonStore';
import ServiceActionModal from './ServiceActionModal';

class ServiceDestroyModal extends ServiceActionModal {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceDeleteError',
          'serviceDeleteSuccess',
          'groupDeleteError',
          'groupDeleteSuccess'
        ],
        suppressUpdate: true
      }
    ];

    this.onMarathonStoreServiceDeleteError = this.onError;
    this.onMarathonStoreServiceDeleteSuccess = this.closeDialog;
    this.onMarathonStoreGroupDeleteError = this.onError;
    this.onMarathonStoreGroupDeleteSuccess =
      this.onMarathonStoreServiceDeleteSuccess;
  }

  handleConfirmClick() {
    super.handleConfirmClick();

    let {service} = this.props;
    let serviceID = service.getId();
    let forceUpdate = this.shouldForceUpdate();

    if (this.isGroup()) {
      MarathonStore.deleteGroup(serviceID, forceUpdate);
    } else {
      MarathonStore.deleteService(serviceID, forceUpdate);
    }
  }

  render() {
    const {open, service} = this.props;
    let itemText = this.getServiceType();
    let serviceName = '';

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={this.state.disabled}
        open={open}
        onClose={this.handleCloseClick}
        leftButtonText="Cancel"
        leftButtonCallback={this.handleCloseClick}
        rightButtonText={`Destroy ${itemText}`}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleConfirmClick}>
        <div className="container-pod flush-top container-pod-short-bottom">
          <h2 className="text-danger text-align-center flush-top">
            Destroy {itemText}
          </h2>
          <p>Destroying <span className="emphasize">{serviceName}</span> is irreversible. Are you sure you want to continue?</p>
          {this.getErrorMessage()}
        </div>
      </Confirm>
    );
  }
}

module.exports = ServiceDestroyModal;
