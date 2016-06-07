import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import FormModal from '../FormModal';

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
    className: 'button button-warning button-medium',
    isSubmit: true
  }
];

class ServiceGroupFormModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disableForm: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  resetState() {
    this.setState({
      disableForm: false
    });
  }

  handleScaleSubmit({instances}) {
    this.resetState();
    this.props.onClose();
  }

  getScaleFormDefinition() {
    let {service} = this.props;
    let instancesCount = service.getInstancesCount();

    return [
      {
        fieldType: 'number',
        min: 0,
        name: 'instances',
        placeholder: instancesCount,
        value: instancesCount,
        required: true,
        showLabel: false,
        writeType: 'input'
      }
    ];
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
        <h2 className="modal-header-title text-align-center flush-top">
          Scale Service
        </h2>
        <p className="text-align-center flush-top">
          How many instances would you like to scale to?
        </p>
      </FormModal>
    );
  }
}

ServiceGroupFormModal.propTypes = {
  service: React.PropTypes.object.isRequired
};

module.exports = ServiceGroupFormModal;
