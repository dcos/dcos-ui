import {Hooks} from 'PluginSDK';
import React from 'react';

import SchemaForm from './SchemaForm';
import SchemaFormUtil from '../utils/SchemaFormUtil';
import SchemaUtil from '../utils/SchemaUtil';

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
    Hooks.doAction('serviceFormMount', this);
  }

  handleFormChange() {
    Hooks.doAction('serviceFormChange', ...arguments);
    // Handle the form change in the way service needs here.
    this.props.onChange(...arguments);
    return;
  }

  getNewDefinition() {
    let {model, schema} = this.props;
    schema = Hooks.applyFilter('serviceFormSchema', schema);
    let definition = SchemaUtil.schemaToMultipleDefinition(
      schema,
      this.getSubHeader,
      this.getLabel,
      this.getRemoveRowButton,
      this.getAddNewRowButton
    );

    if (model) {
      SchemaFormUtil.mergeModelIntoDefinition(
        model,
        definition,
        this.getRemoveRowButton
      );
    }

    return definition;
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
