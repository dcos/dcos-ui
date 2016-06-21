import classNames from 'classnames/dedupe';
import {Form, Tooltip} from 'reactjs-components';
import GeminiScrollbar from 'react-gemini-scrollbar';
import mixin from 'reactjs-mixin';
import React from 'react';

import GeminiUtil from '../utils/GeminiUtil';
import Icon from './Icon';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import SideTabs from './SideTabs';

const METHODS_TO_BIND = [
  'getTriggerSubmit',
  'handleFormError',
  'handleTabClick',
  'handleExternalSubmit'
];

class TabForm extends mixin(InternalStorageMixin) {
  constructor() {
    super();

    this.state = {currentTab: '', renderGemini: false};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.triggerSubmit = function () {};
  }

  componentWillMount() {
    this.model = {};
    this.submitMap = {};

    this.setState({
      currentTab: Object.keys(this.props.definition)[0]
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

  handleFormError() {
    this.internalStorage_update({isFormValidated: false});
  }

  handleFormSubmit(formKey, formModel) {
    this.model[formKey] = formModel;
  }

  handleExternalSubmit() {
    this.buildModel();
    let {isFormValidated} = this.internalStorage_get();

    if (isFormValidated) {
      this.props.onSubmit(this.model);
      return this.model;
    } else {
      this.props.onError();
      return false;
    }
  }

  buildModel() {
    this.internalStorage_update({isFormValidated: true});

    Object.keys(this.props.definition).forEach((formKey) => {
      this.submitMap[formKey]();
    });
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
            <Tooltip
              content={description}
              interactive={true}
              wrapperClassName="tooltip-wrapper media-object-item"
              wrapText={true}
              maxWidth={300}
              scrollContainer=".gm-scroll-view">
              <Icon color="grey" id="ring-question" size="mini" family="mini" />
            </Tooltip>
          </div>
        </span>
      </label>
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
    let classes = classNames(
      'column-mini-12 column-small-4 multiple-form-left-column',
      this.props.navigationContentClassNames
    );

    return (
      <div className={classes}>
        <SideTabs
          onTabClick={this.handleTabClick}
          selectedTab={currentTab}
          tabs={Object.values(multipleDefinition)} />
      </div>
    );
  }

  getFormPanels() {
    let currentTab = this.state.currentTab;
    let multipleDefinition = this.props.definition;
    let multipleDefinitionClasses = classNames(
      'multiple-form-right-column column-mini-12 column-small-8',
      this.props.formContentClassNames
    );
    let formRowClass = this.props.formRowClass;

    let panels = Object.keys(multipleDefinition).map((formKey, i) => {
      let panelClassSet = classNames('form', {
        'hidden': currentTab !== formKey
      });

      let {definition, description, title} = multipleDefinition[formKey];
      let formDefinition = [{
        render: this.getHeader.bind(this, title, description)
      }].concat(definition);

      let formRowClasses = {};
      // Add tab key to formRowClasses for custom styling
      if (definition.itemShapes) {
        Object.keys(definition.itemShapes).forEach(function (key) {
          formRowClasses[key] = true;
        });
      }
      let formRowClassSet = classNames('row', formRowClass, formRowClasses);

      return (
        <div key={i} className="form-panel">
          <Form
            className={panelClassSet}
            formGroupClass="form-group flush"
            formRowClass={formRowClassSet}
            definition={formDefinition}
            triggerSubmit={this.getTriggerSubmit.bind(this, formKey)}
            onChange={this.props.onChange}
            onError={this.handleFormError}
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
    let classNameSet = classNames('multiple-form row', this.props.className);

    return (
      <div className={classNameSet}>
        {this.getSideContent(this.props.definition)}
        {this.getFormPanels()}
      </div>
    );
  }
}

TabForm.defaultProps = {
  getTriggerSubmit: function () {},
  onChange: function () {},
  onError: function () {},
  onSubmit: function () {}
};

const classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

TabForm.propTypes = {
  className: classPropType,
  definition: React.PropTypes.object.isRequired,
  formContentClassNames: classPropType,
  formRowClass: classPropType,
  getTriggerSubmit: React.PropTypes.func,
  navigationContentClassNames: classPropType,
  onError: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onSubmit: React.PropTypes.func
};

module.exports = TabForm;
