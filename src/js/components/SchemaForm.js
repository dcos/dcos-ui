import classNames from 'classnames';
import {Form, Tooltip} from 'reactjs-components';
import GeminiScrollbar from 'react-gemini-scrollbar';
import React from 'react';

import GeminiUtil from '../utils/GeminiUtil';
import SideTabs from './SideTabs';
import SchemaFormUtil from '../utils/SchemaFormUtil';
import SchemaUtil from '../utils/SchemaUtil';

const METHODS_TO_BIND = [
  'getTriggerSubmit', 'validateForm', 'handleFormChange', 'handleTabClick',
  'handleExternalSubmit'
];

class SchemaForm extends React.Component {
  constructor() {
    super();

    this.state = {currentTab: '', renderGemini: false};

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

    this.submitMap = {};
    this.setState({
      currentTab: Object.keys(this.multipleDefinition)[0]
    });

    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  componentDidMount() {
    this.setState({renderGemini: true});
  }

  componentDidUpdate() {
    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      GeminiUtil.updateWithRef(this.refs.geminiForms);
    });
  }

  handleTabClick(currentTab) {
    this.setState({currentTab});
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

    setTimeout(() => {
      this.validateForm();
      this.props.onChange(this.getDataTriple());
    });
  }

  handleFormSubmit(formKey, formModel) {
    this.model[formKey] = formModel;
  }

  handleExternalSubmit() {
    this.validateForm();
    return this.getDataTriple();
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
      schema, this.getSubHeader, this.getLabel
    );

    if (model) {
      SchemaFormUtil.mergeModelIntoDefinition(model, definition);
    }

    return definition;
  }

  buildModel() {
    Object.keys(this.multipleDefinition).forEach((formKey) => {
      this.submitMap[formKey]();
    });
  }

  validateForm() {
    let schema = this.props.schema;
    let isValidated = true;

    this.buildModel();
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

  getTriggerSubmit(formKey, triggerSubmit) {
    this.submitMap[formKey] = triggerSubmit;
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

  getServiceHeader() {
    let {packageIcon, packageName, packageVersion} = this.props;

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

  getFormHeader() {
    if (this.props.headerText != null) {
      return this.getTitleHeader();
    }

    return this.getServiceHeader();
  }

  getTitleHeader() {
    let {headerText}= this.props;

    return (
      <div className="modal-header modal-header-padding-narrow modal-header-bottom-border modal-header-white flex-no-shrink">
        <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
          <div className="media-object media-object-align-middle">
            {headerText}
          </div>
        </div>
      </div>
    );
  }

  getHeader(title, description) {
    return (
      <div key={title} className="form-row-element">
        <h3 className="form-header flush-bottom">{title}</h3>
        <p className="flush-bottom">{description}</p>
      </div>
    );
  }

  getSideContent(multipleDefinition) {
    let {currentTab} = this.state;

    return (
      <div className="column-mini-12 column-small-4 multiple-form-left-column">
        <SideTabs
          onTabClick={this.handleTabClick}
          selectedTab={currentTab}
          tabs={Object.values(multipleDefinition)} />
      </div>
    );
  }

  getFormPanels() {
    let currentTab = this.state.currentTab;
    let multipleDefinition = this.multipleDefinition;
    let multipleDefinitionClasses = 'multiple-form-right-column column-mini-12 column-small-8';

    let panels = Object.keys(multipleDefinition).map((formKey, i) => {
      let panelClassSet = classNames('form', {
        'hidden': currentTab !== formKey
      });

      let {definition, description, title} = multipleDefinition[formKey];
      let formDefinition = [{
        render: this.getHeader.bind(this, title, description)
      }].concat(definition);

      return (
        <div key={i} className="form-panel">
          <Form
            className={panelClassSet}
            formGroupClass="form-group flush"
            definition={formDefinition}
            triggerSubmit={this.getTriggerSubmit.bind(this, formKey)}
            onChange={this.handleFormChange}
            onSubmit={this.handleFormSubmit.bind(this, formKey)} />
        </div>
      );
    });

    // On intial render, we don't want to render with Gemini because it will
    // cancel the parent's animation, due to it measuring the component.
    if (!this.state.renderGemini) {
      return (
        <div className={multipleDefinitionClasses}>
          {panels}
        </div>
      );
    }

    return (
      <GeminiScrollbar
        autoshow={true}
        className={multipleDefinitionClasses}
        ref="geminiForms">
        {panels}
      </GeminiScrollbar>
    );
  }

  render() {
    return (
      <div>
        {this.getFormHeader()}
        <div className={this.props.className}>
          {this.getSideContent(this.multipleDefinition)}
          {this.getFormPanels()}
        </div>
      </div>
    );
  }
}

SchemaForm.defaultProps = {
  className: 'multiple-form row',
  getTriggerSubmit: function () {},
  schema: {}
};

SchemaForm.propTypes = {
  getTriggerSubmit: React.PropTypes.func,
  headerText: React.PropTypes.string,
  schema: React.PropTypes.object,
  packageIcon: React.PropTypes.string,
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string
};

module.exports = SchemaForm;
