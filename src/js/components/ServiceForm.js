import {Tooltip} from 'reactjs-components';
import React from 'react';

import FormUtil from '../utils/FormUtil';
import GeminiUtil from '../utils/GeminiUtil';
import SchemaFormUtil from '../utils/SchemaFormUtil';
import SchemaUtil from '../utils/SchemaUtil';
import TabForm from './TabForm';
import Util from '../utils/Util';

const METHODS_TO_BIND = [
  'validateForm', 'getTriggerTabFormSubmit', 'handleFormChange',
  'handleExternalSubmit', 'getRemoveVariableButton', 'getAddNewRowButton'
];

class ServiceForm extends React.Component {
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

  componentWillUnmount() {
    // Unschedule all validation if component unmounts.
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  componentDidUpdate() {
    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      GeminiUtil.updateWithRef(this.refs.geminiForms);
    });
  }

  handleFormChange(formData, eventObj) {
    let isBlur = eventObj.eventType === 'blur';
    let isChange = eventObj.eventType === 'change';
    if (!isBlur && !isChange) {
      return;
    }

    if (isBlur) {
      this.validateForm();
      this.props.onChange(this.getModel());
      return;
    }

    // The cleartimeout is there to debounce the validation. And to make
    // sure it is only run once.
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.validateForm();
      this.props.onChange(this.getModel());
    });
  }

  handleExternalSubmit() {
    this.validateForm();
    return this.getModel();
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

  getAddNewRowButton(prop, generalDefinition, definition) {
    return (
      <button
        className="button"
        onClick={
          this.handleAddRow.bind(this, prop, generalDefinition, definition)
        }>
        Add New Variable
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

  getModel() {
    let model = this.triggerTabFormSubmit();
    return SchemaFormUtil.processFormModel(model, this.multipleDefinition);
  }

  getNewDefinition() {
    let {model, schema} = this.props;
    let definition = SchemaUtil.schemaToMultipleDefinition(
      schema, this.getSubHeader, this.getLabel, this.getRemoveVariableButton, this.getAddNewRowButton
    );

    if (model) {
      SchemaFormUtil.mergeModelIntoDefinition(model, definition, this.getRemoveVariableButton);
    }

    return definition;
  }

  getTriggerTabFormSubmit(submitTrigger) {
    this.triggerTabFormSubmit = submitTrigger;
  }

  validateForm() {
    return true;
  }

  getSubHeader(name) {
    return (
      <div key={name}>
        <div className="h5 form-row-element flush-bottom flush-top">
          {name}
        </div>
      </div>
    );
  }

  getLabel(description, label) {
    return (
      <label>
        <span className="media-object-spacing-wrapper
          media-object-spacing-narrow">
          <div className="media-object">
            <span className="media-object-item">
              {label}
            </span>
            <Tooltip content={description} wrapperClassName="tooltip-wrapper
              media-object-item" wrapText={true} maxWidth={300}
              scrollContainer=".gm-scroll-view">
              <i className="icon icon-sprite icon-sprite-mini icon-error" />
            </Tooltip>
          </div>
        </span>
      </label>
    );
  }

  render() {
    return (
      <TabForm
        definition={this.multipleDefinition}
        getTriggerSubmit={this.getTriggerTabFormSubmit}
        onChange={this.handleFormChange} />
    );
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
