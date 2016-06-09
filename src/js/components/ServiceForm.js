import React from 'react';

import FormUtil from '../utils/FormUtil';
import SchemaForm from './SchemaForm';
import SchemaFormUtil from '../utils/SchemaFormUtil';
import SchemaUtil from '../utils/SchemaUtil';
import Util from '../utils/Util';

const METHODS_TO_BIND = [
  'getAddNewRowButton',
  'getRemoveVariableButton',
  'getTriggerTabFormSubmit',
  'handleFormChange',
  'handleExternalSubmit',
  'validateForm'
];

class ServiceForm extends SchemaForm {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.triggerSubmit = function () {};
    this.isValidated = true;
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  handleRemoveRow(definition, prop, id) {
    FormUtil.removePropID(definition, prop, id);
    this.forceUpdate();
  }

  handleAddRow(prop, definition, newDefinition) {
    let propID = Util.uniqueID(prop);
    newDefinition = FormUtil.getMultipleFieldDefinition(
      prop,
      propID,
      newDefinition
    );
    newDefinition.push(
      this.getRemoveVariableButton(definition, prop, propID)
    );

    // Default to appending.
    let lastIndex = definition.length - 1;
    definition.forEach(function (field, i) {
      if (FormUtil.isFieldInstanceOfProp(prop, field)) {
        lastIndex = i;
      }
    });

    definition.splice(lastIndex + 1, 0, newDefinition);
    this.forceUpdate();
  }

  getAddNewRowButton(prop, generalDefinition, definition, labelText = '') {
    let label = 'Add New Line';

    if (labelText !== '') {
      label = labelText;
    }

    return (
      <button
        className="button"
        onClick={
          this.handleAddRow.bind(this, prop, generalDefinition, definition)
        }>
        {label}
      </button>
    );
  }

  getRemoveVariableButton(generalDefinition, prop, id) {
    return (
      <button
        className="button"
        key={prop + id}
        onClick={this.handleRemoveRow.bind(this, generalDefinition, prop, id)}>
        X
      </button>
    );
  }

  getDataTriple() {
    let model = this.triggerTabFormSubmit();
    return {
      model: SchemaFormUtil.processFormModel(model, this.multipleDefinition)
    };
  }

  getNewDefinition() {
    let {model, schema} = this.props;
    let definition = SchemaUtil.schemaToMultipleDefinition(
      schema,
      this.getSubHeader,
      this.getLabel,
      this.getRemoveVariableButton,
      this.getAddNewRowButton
    );

    if (model) {
      SchemaFormUtil.mergeModelIntoDefinition(
        model,
        definition,
        this.getRemoveVariableButton
      );
    }

    return definition;
  }

  validateForm() {
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
