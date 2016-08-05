import React from 'react';

import SchemaForm from './SchemaForm';
import SchemaFormUtil from '../utils/SchemaFormUtil';

const METHODS_TO_BIND = [
  'handleFormChange',
  'validateForm'
];

class JobForm extends SchemaForm {
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

  handleTabClick(tab) {
    this.props.onTabChange(tab);
  }

  getNewDefinition() {
    let multipleDefinition = super.getNewDefinition();

    // On edit hide the id field.
    if (this.props.isEdit) {
      multipleDefinition.general.definition.forEach(function (definition) {
        if (definition.name === 'id') {
          definition.formElementClass = 'hidden';
        }
      });
    }

    return multipleDefinition;
  }

  getDataTriple() {
    let model = this.triggerTabFormSubmit();
    return {
      model: SchemaFormUtil.processFormModel(model, this.multipleDefinition)
    };
  }

  validateForm() {
    // TODO: Overwrite the default behaviour until DCOS-7669 is fixed.
    return true;
  }
}

JobForm.defaultProps = {
  className: 'multiple-form row',
  defaultTab: '',
  getTriggerSubmit: function () {},
  isEdit: false,
  onChange: function () {},
  onTabChange: function () {},
  schema: {}
};

JobForm.propTypes = {
  className: React.PropTypes.string,
  defaultTab: React.PropTypes.string,
  isEdit: React.PropTypes.bool,
  getTriggerSubmit: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onTabChange: React.PropTypes.func,
  schema: React.PropTypes.object
};

module.exports = JobForm;
