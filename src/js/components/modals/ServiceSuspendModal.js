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

    this.onMarathonStoreServiceEditError = this.onError;
    this.onMarathonStoreServiceEditSuccess = this.closeDialog;
    this.onMarathonStoreGroupEditError = this.onError;
    this.onMarathonStoreGroupEditSuccess =
      this.onMarathonStoreServiceEditSuccess;
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
        <h2 className="text-align-center flush-top">
          Suspend {itemText}
        </h2>
        <p>
          Are you sure you want to suspend <span className="emphasize">{serviceName}</span> by scaling to 0 instances?
        </p>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

module.exports = ServiceSuspendModal;
