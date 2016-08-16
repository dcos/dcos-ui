import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import FormModal from '../FormModal';
import MarathonStore from '../../stores/MarathonStore';
import ServiceTree from '../../structs/ServiceTree';

const METHODS_TO_BIND = [
  'handleScaleSubmit',
  'resetState'
];

const buttonDefinition = [
  {
    text: 'Cancel',
    className: 'button button-medium',
    isClose: true
  },
  {
    text: 'Scale Service',
    className: 'button button-primary button-medium',
    isSubmit: true
  }
];

class ServiceScaleFormModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      disableForm: false,
      errorMsg: null
    };

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceEditError',
          'serviceEditSuccess'
        ]
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  resetState() {
    this.setState({
      disableForm: false,
      errorMsg: null
    });
  }

  shouldForceUpdate(message = this.state.errorMsg) {
    return message && /force=true/.test(message);
  }

  onMarathonStoreServiceEditSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMarathonStoreServiceEditError({message:errorMsg = '', details}) {
    this.resetState();
    let hasDetails = details && details.length !== 0;

    if (hasDetails) {
      this.setState({
        errorMsg: details.reduce(function (memo, error) {

          return `${memo} ${error.errors.join(' ')}`;
        }, '')
      });

      return;
    }

    this.setState({
      errorMsg
    });
  }

  handleScaleSubmit({instances}) {
    let {service} = this.props;

    this.setState({disableForm: true}, () => {
      if (service instanceof ServiceTree) {
        MarathonStore.editGroup({
          id: service.id,
          scaleBy: parseInt(instances, 10)
        });
      } else {
        MarathonStore.editService({
          id: service.id,
          instances: parseInt(instances, 10)
        }, this.shouldForceUpdate(this.state.errorMsg));
      }
    });
  }

  getErrorMessage() {
    let {errorMsg} = this.state;
    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate(errorMsg)) {
      return (
        <h4 className="text-align-center text-danger flush-top">
            App is currently locked by one or more deployments. Press the button
            again to forcefully change and deploy the new configuration.
        </h4>
      );
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  getScaleFormDefinition() {
    let {service} = this.props;
    let instancesCount = service.getInstancesCount();
    if (service instanceof ServiceTree) {
      instancesCount = '1.0';
    }

    return [
      {
        fieldType: 'number',
        formGroupClass: 'column-2',
        formElementClass: 'horizontal-center',
        min: 0,
        name: 'instances',
        placeholder: instancesCount,
        value: instancesCount.toString(),
        required: true,
        showLabel: false,
        writeType: 'input'
      }
    ];
  }

  getHeader() {
    let headerText = 'Service';

    if (this.props.service instanceof ServiceTree) {
      headerText = 'Group';
    }

    return (
      <h2 className="modal-header-title text-align-center flush-top">
        Scale {headerText}
      </h2>
    );
  }

  getBodyText() {
    let bodyText = 'How many instances would you like to scale to?';
    if (this.props.service instanceof ServiceTree) {
      bodyText = 'By which factor would you like to scale all applications within this group?';
    }

    return (
      <p className="text-align-center flush-top">
        {bodyText}
      </p>
    );
  }

  render() {
    let {props, state} = this;

    return (
      <FormModal
        ref="form"
        buttonDefinition={buttonDefinition}
        disabled={state.disableForm}
        onClose={props.onClose}
        onSubmit={this.handleScaleSubmit}
        onChange={this.resetState}
        open={props.open}
        definition={this.getScaleFormDefinition()}>
        {this.getHeader()}
        {this.getBodyText()}
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

ServiceScaleFormModal.propTypes = {
  service: React.PropTypes.object.isRequired
};

module.exports = ServiceScaleFormModal;
