import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Service from '../../structs/Service';
import ServicePlan from '../../structs/ServicePlan';
import ServicePlanProgressModalContents from './ServicePlanProgressModalContents';
import UniversePackage from '../../structs/UniversePackage';
import UpdateConfigModalContents from './UpdateConfigModalContents';

const METHODS_TO_BIND = [
  'handleErrorConfigEditClick',
  'handleModalClose',
  'setPendingRequest'
];

class UpdateConfigModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      updateError: null,
      pendingRequest: false,
      updateSuccess: false
    };

    this.store_listeners = [{
      name: 'cosmosPackages',
      events: [
        'installError',
        'installSuccess'
      ]
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreInstallError(error) {
    this.setState({
      updateError: error,
      pendingRequest: false,
      updateSuccess: false
    });
  }

  onCosmosPackagesStoreInstallSuccess() {
    this.setState({
      updateError: null,
      pendingRequest: false,
      updateSuccess: true
    });
  }

  getConfigUpdateForm() {
    let {props, state} = this;

    return (
      <UpdateConfigModalContents
        handleErrorConfigEditClick={this.handleErrorConfigEditClick}
        pendingRequest={state.pendingRequest}
        updateError={state.updateError}
        updateSuccess={state.updateSuccess}
        onClose={this.handleModalClose}
        servicePackage={props.servicePackage}
        servicePlan={props.servicePlan}
        service={props.service}
        setPendingRequest={this.setPendingRequest} />
    );
  }

  getLoadingIndicator() {
    return (
      <div className="container container-fluid container-pod text-align-center
        vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getUpgradeProgressDetail() {
    if (!this.props.servicePlan) {
      return this.getLoadingIndicator();
    }

    return (
      <ServicePlanProgressModalContents
        service={this.props.service}
        servicePlan={this.props.servicePlan} />
    );
  }

  handleErrorConfigEditClick() {
    this.setState({updateError: null});
  }

  handleModalClose() {
    this.setState({
      pendingRequest: false,
      updateError: null,
      updateSuccess: false
    });
    this.props.onClose();
  }

  setPendingRequest(pendingRequest) {
    this.setState({pendingRequest});
  }

  render() {
    let {props, state} = this;
    let {updateError, updateSuccess} = state;
    let modalClassesModifier;

    if (!!props.servicePlan) {
      modalClassesModifier = {
        'modal-narrow': props.servicePlan.hasError()
          || props.servicePlan.isComplete()
      };
    }

    let modalClasses = classNames('modal', {
      'modal-large': updateError == null && !updateSuccess,
      'modal-narrow': !!updateError,
      modalClassesModifier
    });

    let content = this.getConfigUpdateForm();

    if (updateSuccess) {
      content = this.getUpgradeProgressDetail();
    }

    return (
      <Modal
        backdropClass="modal-backdrop"
        bodyClass=""
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass={modalClasses}
        modalWrapperClass="multiple-form-modal"
        onClose={this.handleModalClose}
        open={props.open}
        showCloseButton={false}
        showFooter={false}>
        {content}
      </Modal>
    );
  }
}

UpdateConfigModal.defaultProps = {
  onClose: function () {},
  open: false
};

UpdateConfigModal.propTypes = {
  onClose: React.PropTypes.func,
  open: React.PropTypes.bool,
  servicePackage: React.PropTypes.instanceOf(UniversePackage),
  servicePlan: React.PropTypes.instanceOf(ServicePlan),
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = UpdateConfigModal;
