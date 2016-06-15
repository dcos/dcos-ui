import {Tooltip} from 'reactjs-components';
import React from 'react';

import FormUtil from '../utils/FormUtil';
import GeminiUtil from '../utils/GeminiUtil';
import SchemaFormUtil from '../utils/SchemaFormUtil';
import SchemaUtil from '../utils/SchemaUtil';
import TabForm from './TabForm';
import Util from '../utils/Util';

const METHODS_TO_BIND = [
  'getAddNewRowButton',
  'getRemoveRowButton',
  'getTriggerTabFormSubmit',
  'handleFormChange',
  'handleExternalSubmit',
  'validateForm'
];

class SchemaForm extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.triggerSubmit = function () {};
    this.isValidated = true;
  }

  componentWillMount() {
    if (this.props.definition) {
      this.multipleDefinition = this.props.definition;
    } else {
      this.multipleDefinition = this.getNewDefinition();
    }

    if (this.props.model) {
      this.model = this.props.model;
      SchemaFormUtil.mergeModelIntoDefinition(this.model, this.multipleDefinition);
    } else {
      this.model = {};
    }

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
      this.props.onChange(this.getDataTriple());
      return;
    }

    // The cleartimeout is there to debounce the validation. And to make
    // sure it is only run once.
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.validateForm();
      this.props.onChange(this.getDataTriple());
    });
  }

  handleExternalSubmit() {
    this.validateForm();
    return this.getDataTriple();
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
      this.getRemoveRowButton(definition, prop, propID)
    );

    // Default to prepending.
    let lastIndex = -1;
    definition.forEach(function (field, i) {
      if (FormUtil.isFieldInstanceOfProp(prop, field)) {
        lastIndex = i;
        return;
      }

      if (field.props && field.props.prop === prop) {
        lastIndex = i - 1;
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
        prop={prop}
        onClick={
          this.handleAddRow.bind(this, prop, generalDefinition, definition)
        }>
        {label}
      </button>
    );
  }

  getRemoveRowButton(generalDefinition, prop, id) {
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
    return {
      isValidated: this.isValidated,
      model: SchemaFormUtil.processFormModel(this.model, this.multipleDefinition),
      definition: this.multipleDefinition
    };
  }

  getNewDefinition() {
    let {model, schema} = this.props;
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

  getTriggerTabFormSubmit(submitTrigger) {
    this.triggerTabFormSubmit = submitTrigger;
  }

  validateForm() {
    let schema = this.props.schema;
    let isValidated = true;

    this.model = this.triggerTabFormSubmit();
    // Reset the definition in order to reset all errors.
    this.multipleDefinition = this.getNewDefinition();
    let model = SchemaFormUtil.processFormModel(
      this.model, this.multipleDefinition
    );

    SchemaFormUtil.validateModelWithSchema(model, schema).forEach((error) => {
      let path = error.path;
      let obj = SchemaFormUtil.getDefinitionFromPath(
        this.multipleDefinition, path
      );

      isValidated = false;
      obj.showError = error.message;
      obj.validationErrorText = error.message;
    });

    this.forceUpdate();
    this.isValidated = isValidated;
    return isValidated;
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

  getFormHeader() {
    let {packageIcon, packageName, packageVersion} = this.props;

    if (!packageName || !packageIcon) {
      return null;
    }

    return (
      <div className="modal-header modal-header-padding-narrow modal-header-bottom-border modal-header-white flex-no-shrink">
        <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
          <div className="media-object media-object-align-middle">
            <div className="media-object-item">
              <div className="icon icon-sprite icon-sprite-medium icon-sprite-medium-color icon-image-container icon-app-container icon-default-white">
                <img src={packageIcon} />
              </div>
            </div>
            <div className="media-object-item">
              <h4 className="flush-top flush-bottom text-color-neutral">
                {packageName}
              </h4>
              <span className="side-panel-resource-label">
                {packageVersion}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.getFormHeader()}
        <TabForm
          definition={this.multipleDefinition}
          getTriggerSubmit={this.getTriggerTabFormSubmit}
          onChange={this.handleFormChange} />
      </div>
    );
  }
}

SchemaForm.defaultProps = {
  className: 'multiple-form row',
  getTriggerSubmit: function () {},
  onChange: function () {},
  schema: {}
};

SchemaForm.propTypes = {
  getTriggerSubmit: React.PropTypes.func,
  schema: React.PropTypes.object,
  packageIcon: React.PropTypes.string,
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string
};

module.exports = SchemaForm;
