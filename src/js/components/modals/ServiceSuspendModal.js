import {Confirm} from 'reactjs-components';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import MarathonStore from '../../stores/MarathonStore';
import Pod from '../../structs/Pod';
import ServiceTree from '../../structs/ServiceTree';
import ServiceActionModal from './ServiceActionModal';
import ServiceSpecUtil from '../../utils/ServiceSpecUtil';

class ServiceSuspendModal extends ServiceActionModal {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceEditError',
          'serviceEditSuccess',
          'groupEditError',
          'groupEditSuccess'
        ],
        suppressUpdate: true
      }
    ];

    this.onMarathonStoreServiceEditSuccess = this.closeDialog;
    this.onMarathonStoreGroupEditSuccess = this.closeDialog;
  }

  onMarathonStoreServiceEditError() {
    this.onMarathonStoreServiceOrGroupEditError.apply(this, arguments);
  }

  onMarathonStoreGroupEditError() {
    this.onMarathonStoreServiceOrGroupEditError.apply(this, arguments);
  }

  onMarathonStoreServiceOrGroupEditError({message:errorMsg = '', details}) {
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
    let isGroup = service instanceof ServiceTree;
    let serviceID = service.getId();
    let forceUpdate = this.shouldForceUpdate(this.state.errorMsg);

    if (isGroup) {
      MarathonStore.editGroup({id: serviceID, scaleBy: 0}, forceUpdate);
    } else {
      MarathonStore.editService(service,
        ServiceSpecUtil.setServiceInstances(service.getSpec(), 0),
        this.shouldForceUpdate(this.state.errorMsg)
      );
    }
  }

  render() {
    const {open, service} = this.props;
    let itemText = 'Service';
    let serviceName = '';

    if (service instanceof Pod) {
      itemText = 'Pod';
    }

    if (service instanceof ServiceTree) {
      itemText = 'Group';
    }

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={this.state.disabled}
        open={open}
        onClose={this.handleCloseClick}
        leftButtonCallback={this.handleCloseClick}
        rightButtonText={`Suspend ${itemText}`}
        rightButtonCallback={this.handleConfirmClick}>
        <div className="container-pod flush-top container-pod-short-bottom">
          <h2 className="text-align-center flush-top">
            Suspend {itemText}
          </h2>
          <p>
            Are you sure you want to suspend <span className="emphasize">{serviceName}</span> by scaling to 0 instances?
          </p>
          {this.getErrorMessage()}
        </div>
      </Confirm>
    );
  }
}

module.exports = ServiceSuspendModal;
