import classNames from "classnames/dedupe";
import { Form, Tooltip } from "reactjs-components";
import GeminiScrollbar from "react-gemini-scrollbar";
import mixin from "reactjs-mixin";
import React from "react";

import Icon from "./Icon";
import InternalStorageMixin from "../mixins/InternalStorageMixin";
import ScrollbarUtil from "../utils/ScrollbarUtil";
import SideTabs from "./SideTabs";

const METHODS_TO_BIND = [
  "getTriggerSubmit",
  "handleFormError",
  "handleTabClick",
  "handleExternalSubmit"
];

class TabForm extends mixin(InternalStorageMixin) {
  constructor() {
    super();

    this.state = { currentTab: "", renderGemini: false };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.triggerSubmit = function() {};
  }

  componentWillMount() {
    this.model = {};
    this.submitMap = {};

    const currentTab =
      this.props.defaultTab || Object.keys(this.props.definition)[0];

    this.setState({ currentTab });
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({ renderGemini: true });
    /* eslint-enable react/no-did-mount-set-state */
  }

  componentDidUpdate() {
    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      ScrollbarUtil.updateWithRef(this.refs.geminiForms);
    });
  }

  handleTabClick(currentTab) {
    this.props.onTabClick(...arguments);
    this.setState({ currentTab });
  }

  handleFormError() {
    this.internalStorage_update({ isFormValidated: false });
  }

  handleFormSubmit(formKey, formModel) {
    this.model[formKey] = formModel;
  }

  handleExternalSubmit() {
    this.buildModel();
    const { isFormValidated } = this.internalStorage_get();

    if (isFormValidated) {
      this.props.onSubmit(this.model);

      return this.model;
    } else {
      this.props.onError();

      return false;
    }
  }

  buildModel() {
    this.internalStorage_update({ isFormValidated: true });

    Object.keys(this.props.definition).forEach(formKey => {
      this.submitMap[formKey]();
    });
  }

  getTriggerSubmit(formKey, triggerSubmit) {
    this.submitMap[formKey] = triggerSubmit;
  }

  getSubHeader(name) {
    return (
      <div key={name}>
        <div className="h3 form-row-element flush-bottom flush-top">
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
              scrollContainer=".gm-scroll-view"
            >
              <Icon color="grey" id="circle-question" size="mini" />
            </Tooltip>
          </div>
        </span>
      </label>
    );
  }

  getHeader(title, description) {
    return (
      <div key={title} className="form-row-element">
        <h2 className="form-header flush-top short-bottom">{title}</h2>
        <p className="flush-bottom">{description}</p>
      </div>
    );
  }

  getSideContent(multipleDefinition) {
    const { currentTab } = this.state;
    const classes = classNames(
      "multiple-form-left-column",
      this.props.navigationContentClassNames
    );

    return (
      <div className={classes}>
        <SideTabs
          onTabClick={this.handleTabClick}
          selectedTab={currentTab}
          tabs={Object.values(multipleDefinition)}
        />
      </div>
    );
  }

  getFormPanels() {
    const currentTab = this.state.currentTab;
    const multipleDefinition = this.props.definition;
    const multipleDefinitionClasses = classNames(
      "multiple-form-right-column",
      this.props.formContentClassNames
    );
    const formRowClass = this.props.formRowClass;

    const panels = Object.keys(multipleDefinition).map((formKey, i) => {
      const formPanelClassSet = classNames("form-panel", {
        hidden: currentTab !== formKey
      });

      const { definition, description, title } = multipleDefinition[formKey];
      const formDefinition = [
        {
          render: this.getHeader.bind(this, title, description)
        }
      ].concat(definition);

      const formRowClassSet = classNames("row", formRowClass, formKey);

      return (
        <div key={i} className={formPanelClassSet}>
          <Form
            formGroupClass="form-group flush"
            formRowClass={formRowClassSet}
            definition={formDefinition}
            triggerSubmit={this.getTriggerSubmit.bind(this, formKey)}
            onChange={this.props.onChange}
            onError={this.handleFormError}
            onSubmit={this.handleFormSubmit.bind(this, formKey)}
            useExternalErrors={true}
          />
        </div>
      );
    });

    // On initial render, we don't want to render with Gemini because it will
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
        ref="geminiForms"
      >
        {panels}
      </GeminiScrollbar>
    );
  }

  render() {
    const classNameSet = classNames("multiple-form", this.props.className);

    return (
      <div className={classNameSet}>
        {this.getSideContent(this.props.definition)}
        {this.getFormPanels()}
      </div>
    );
  }
}

TabForm.defaultProps = {
  defaultTab: "",
  getTriggerSubmit() {},
  onChange() {},
  onError() {},
  onSubmit() {},
  onTabClick() {}
};

const classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

TabForm.propTypes = {
  className: classPropType,
  defaultTab: React.PropTypes.string,
  definition: React.PropTypes.object.isRequired,
  formContentClassNames: classPropType,
  formRowClass: classPropType,
  getTriggerSubmit: React.PropTypes.func,
  navigationContentClassNames: classPropType,
  onError: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
  onTabClick: React.PropTypes.func
};

module.exports = TabForm;
