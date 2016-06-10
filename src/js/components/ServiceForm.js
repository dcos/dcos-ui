import {Hooks} from 'PluginSDK';
import React from 'react';

import FormUtil from '../utils/FormUtil';
import SchemaForm from './SchemaForm';

const METHODS_TO_BIND = [
  'handleFormChange',
  'validateForm'
];

class ServiceForm extends SchemaForm {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.store_listeners = Hooks.applyFilter(
      'serviceFormStoreListeners', []
    );
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    Hooks.doAction('serviceFormMount');
  }

  handleVariableSecretClick(fieldName, prop) {
    let propIndex = FormUtil.getPropIndex(fieldName);
    let variablesDefinition = this.multipleDefinition
      .environmentVariables.definition;

    if (!variablesDefinition) {
      return;
    }

    variablesDefinition.forEach(function (field) {
      if (!Array.isArray(field)) {
        return;
      }

      field.forEach(function (fieldColumn) {
        let propKey = FormUtil.getPropKey(fieldColumn.name);
        if (FormUtil.isFieldInstanceOfProp(prop, fieldColumn, propIndex) &&
          propKey === 'value') {
          if (fieldColumn.fieldType === 'text') {
            fieldColumn.fieldType = 'select';
            fieldColumn.options = Hooks.applyFilter(
              'environmentVariableValueList', []
            );
          } else {
            fieldColumn.fieldType = 'text';
          }
        }
      });

    });

    this.forceUpdate();
  }

  // There will likely be more methods in this component in the future to handle
  // the the healthCheck dropdown select / secrets select inside of
  // environment variables tab, etc.

  handleFormChange(formData, eventObj) {
    let {fieldName} = eventObj;
    let prop = FormUtil.getProp(fieldName);
    let propKey = FormUtil.getPropKey(fieldName);

    if (propKey === 'isSecret' && prop === 'variables') {
      this.handleVariableSecretClick(fieldName, prop);
    }
    // Handle the form change in the way service needs here.
    this.props.onChange(...arguments);
    return;
  }

  validateForm() {
    this.model = this.triggerTabFormSubmit();
    // Handle the form change in the way service needs here.
    this.isValidated = true;
    return true;
  }
}

ServiceForm.defaultProps = {
  className: 'multiple-form row',
  getTriggerSubmit: function () {},
  onChange: function () {},
  schema: {}
};

ServiceForm.propTypes = {
  className: React.PropTypes.string,
  getTriggerSubmit: React.PropTypes.func,
  onChange: React.PropTypes.func,
  schema: React.PropTypes.object
};

module.exports = ServiceForm;
