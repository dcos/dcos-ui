import React from 'react';

import SchemaForm from './SchemaForm';
import SchemaFormUtil from '../utils/SchemaFormUtil';

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
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  handleFormChange() {
    // Handle the form change in the way service needs here.
    return;
  }

  getDataTriple() {
    let model = this.triggerTabFormSubmit();
    return {
      model: SchemaFormUtil.processFormModel(model, this.multipleDefinition)
    };
  }

  validateForm() {
    // Handle the form change in the way service needs here.
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
