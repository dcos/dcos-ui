import React from 'react';

import SchemaForm from './SchemaForm';
import SchemaFormUtil from '../utils/SchemaFormUtil';

const METHODS_TO_BIND = [
  'handleFormChange',
  'validateForm'
];

const SCHEDULE_FIELDS = ['cron', 'timezone', 'startingDeadlineSeconds'];

class JobForm extends SchemaForm {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleFormChange(formData, eventObj) {
    // Fire changes only on blur
    // and on schedule runOnSchedule checkbox change to show/hide fields
    let scheduleEnabledChange = formData.hasOwnProperty('cron') &&
      eventObj.eventType === 'change' &&
      eventObj.fieldName === 'runOnSchedule';
    if (eventObj.eventType !== 'blur' && !scheduleEnabledChange) {
      return;
    }

    this.validateForm();
    this.multipleDefinition = this.getNewDefinition();
    this.model = this.triggerTabFormSubmit();
    this.props.onChange(this.getDataTriple());
    this.forceUpdate();
  }

  handleTabClick(tab) {
    this.props.onTabChange(tab);
  }

  getNewDefinition() {
    let multipleDefinition = super.getNewDefinition();

    let scheduleEnabled = !this.model || this.model.schedule.runOnSchedule;
    if (!scheduleEnabled) {
      multipleDefinition.schedule.definition.forEach(function (definition) {
        if (SCHEDULE_FIELDS.includes(definition.name)) {
          definition.formElementClass = 'hidden';
          definition.value = null;
        }
      });
    }

    return multipleDefinition;
  }

  getDataTriple() {
    return {
      model: SchemaFormUtil.processFormModel(this.model, this.multipleDefinition)
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
  getTriggerSubmit() {},
  isEdit: false,
  onChange() {},
  onTabChange() {},
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
