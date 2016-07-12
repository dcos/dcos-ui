import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Tooltip} from 'reactjs-components';

import FormUtil from '../utils/FormUtil';
import GeminiUtil from '../utils/GeminiUtil';
import Icon from './Icon';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
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
  'handleTabClick',
  'validateForm'
];

class SchemaForm extends mixin(StoreMixin, InternalStorageMixin) {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.store_listeners = [];

    this.triggerSubmit = function () {};
    this.isValidated = true;
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

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
    super.componentWillUnmount(...arguments);

    // Unschedule all validation if component unmounts.
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  componentDidUpdate() {
    super.componentDidUpdate(...arguments);

    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      GeminiUtil.updateWithRef(this.refs.geminiForms);
    });
  }

  handleFormChange(formData, eventObj) {
    if (eventObj.eventType !== 'blur') {
      return;
    }

    this.validateForm();
    this.props.onChange(this.getDataTriple());
  }

  handleExternalSubmit() {
    this.validateForm();
    return this.getDataTriple();
  }

  handleRemoveRow(definition, prop, id) {
    FormUtil.removePropID(definition, prop, id);
    this.forceUpdate();
  }

  handleTabClick() {
    // Default method.
  }

  handleAddRow(prop, definition, newDefinition) {
    let propID = Util.uniqueID(prop);
    newDefinition = FormUtil.getMultipleFieldDefinition(
      prop,
      propID,
      newDefinition
    );

    let deleteButtonTop = Object.values(definition.itemShapes || {})
      .some(function (itemShape) {
        return itemShape.deleteButtonTop;
      });

    // Default to prepending.
    let lastIndex = -1;
    definition.forEach(function (field, i) {
      if (FormUtil.isFieldInstanceOfProp(prop, field)) {
        lastIndex = i;
        return;
      }

      if (field.prop === prop) {
        lastIndex = i - 1;
      }
    });

    let arrayAction = 'push';

    if (deleteButtonTop) {
      arrayAction = 'unshift';
    }
    let title = null;
    Object.values(definition.itemShapes || {}).some(function (itemShape) {
      if (itemShape.getTitle) {
        title = itemShape.getTitle(lastIndex + 2);
      }

      return title;
    });
    newDefinition[arrayAction](
      this.getRemoveRowButton(definition, prop, propID, title)
    );
    definition.splice(lastIndex + 1, 0, newDefinition);

    this.forceUpdate();
  }

  getAddNewRowButton(prop, generalDefinition, definition, labelText = '') {
    let label = 'Add New Line';

    if (labelText !== '') {
      label = labelText;
    }

    return (
      <div prop={prop} key={`${prop}-add-new-row`}>
        <div className="row form-row-element">
          <a
            className="clickable row"
            onClick={
              this.handleAddRow.bind(this, prop, generalDefinition, definition)
            }>
            + {label}
          </a>
        </div>
      </div>
    );
  }

  getRemoveRowButton(generalDefinition, prop, id, title = null) {
    let deleteButton = (
      <div key={`${prop}${id}-remove`} className="form-row-element form-row-remove-button align-self-flex-end">
        <button
          className="button button-link"
          onClick={this.handleRemoveRow.bind(this, generalDefinition, prop, id)}>
          <Icon id="close" size="mini" family="mini" />
        </button>
      </div>
    );

    if (!title) {
      return deleteButton;
    }

    return (
      <div key={`${prop}${id}-title`} className="form-row-element duplicable-row-title-wrapper">
        <div className="duplicable-row-title-container">
          <div className="duplicable-row-title">
            {title}
          </div>
        </div>
        {deleteButton}
      </div>
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

  getSubHeader(name, description) {
    let tooltip = null;
    if (description) {
      tooltip = (
        <Tooltip content={description} wrapperClassName="tooltip-wrapper h3
          flush-bottom short-top media-object-item" wrapText={true}
          maxWidth={300} scrollContainer=".gm-scroll-view">
          <Icon
            color="grey"
            family="mini"
            id="ring-question"
            size="mini" />
        </Tooltip>
      );
    }

    return (
      <div className="media-object-spacing-wrapper
          media-object-spacing-narrow">
        <div className="media-object">
          <div className="media-object-item">
            <h3 className="form-header form-row-element flush-bottom short-top">
              {name}
            </h3>
          </div>
          {tooltip}
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
              interactive={true}
              scrollContainer=".gm-scroll-view">
              <Icon
                color="grey"
                family="mini"
                id="ring-question"
                size="mini" />
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
              <div className="icon icon-medium icon-image-container icon-app-container icon-default-white">
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
          formRowClass="flex-box"
          getTriggerSubmit={this.getTriggerTabFormSubmit}
          onChange={this.handleFormChange}
          onTabClick={this.handleTabClick} />
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
