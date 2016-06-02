import classNames from 'classnames';
import {Form, Tooltip} from 'reactjs-components';
import GeminiScrollbar from 'react-gemini-scrollbar';
import React from 'react';

import GeminiUtil from '../utils/GeminiUtil';
import SideTabs from './SideTabs';

const METHODS_TO_BIND = [
  'getTriggerSubmit', 'validateForm', 'handleTabClick', 'handleExternalSubmit'
];

class TabForm extends React.Component {
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

  handleFormSubmit(formKey, formModel) {
    this.model[formKey] = formModel;
  }

  handleExternalSubmit() {
    return this.validateForm();
  }

  validateForm() {
    this.buildModel();
    this.props.onSubmit(this.model);
    return this.model;
  }

  buildModel() {
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
    let multipleDefinition = this.props.definition;
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
            onChange={this.props.onChange}
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
      <div className={this.props.className}>
        {this.getSideContent(this.props.definition)}
        {this.getFormPanels()}
      </div>
    );
  }
}

TabForm.defaultProps = {
  className: 'multiple-form row',
  getTriggerSubmit: function () {},
  onChange: function () {},
  onSubmit: function () {}
};

TabForm.propTypes = {
  className: React.PropTypes.string,
  getTriggerSubmit: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onSubmit: React.PropTypes.func
};

module.exports = TabForm;
