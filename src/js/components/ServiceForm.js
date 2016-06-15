import React from 'react';

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
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  // There will likely be more methods in this component in the future to handle
  // the the healthCheck dropdown select / secrets select inside of
  // environment variables tab, etc.

  handleFormChange() {
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
