import classNames from "classnames/dedupe";
import { Form, Tooltip } from "reactjs-components";
import GeminiScrollbar from "react-gemini-scrollbar";
import PropTypes from "prop-types";
import * as React from "react";

import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

import ScrollbarUtil from "../utils/ScrollbarUtil";
import SideTabs from "./SideTabs";

class TabForm extends React.Component {
  static defaultProps = {
    defaultTab: "",
    getTriggerSubmit() {},
    onChange() {},
    onError() {},
    onSubmit() {},
    onTabClick() {},
  };
  static propTypes = {
    className: classPropType,
    defaultTab: PropTypes.string,
    definition: PropTypes.object.isRequired,
    formContentClassNames: classPropType,
    formRowClass: classPropType,
    getTriggerSubmit: PropTypes.func,
    navigationContentClassNames: classPropType,
    onError: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onTabClick: PropTypes.func,
  };

  state = { currentTab: "", renderGemini: false };

  geminiRef = React.createRef();

  triggerSubmit = () => {};

  UNSAFE_componentWillMount() {
    this.model = {};
    this.submitMap = {};

    const currentTab =
      this.props.defaultTab || Object.keys(this.props.definition)[0];

    this.setState({ currentTab });
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  componentDidMount() {
    this.setState({ renderGemini: true });
  }

  componentDidUpdate() {
    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      ScrollbarUtil.updateWithRef(this.geminiRef);
    });
  }
  handleTabClick = (currentTab) => {
    this.props.onTabClick(...arguments);
    this.setState({ currentTab });
  };
  handleFormError = () => {
    this.isFormValidated = false;
  };

  handleFormSubmit(formKey, formModel) {
    this.model[formKey] = formModel;
  }
  handleExternalSubmit = () => {
    this.buildModel();
    if (this.isFormValidated) {
      this.props.onSubmit(this.model);

      return this.model;
    }
    this.props.onError();

    return false;
  };

  buildModel() {
    this.isFormValidated = true;

    Object.keys(this.props.definition).forEach((formKey) => {
      this.submitMap[formKey]();
    });
  }
  getTriggerSubmit = (formKey, triggerSubmit) => {
    this.submitMap[formKey] = triggerSubmit;
  };

  getSubHeader(name) {
    return (
      <div key={name}>
        <div className="h3 form-row-element flush-bottom flush-top">{name}</div>
      </div>
    );
  }

  getLabel(description, label) {
    return (
      <label>
        <span
          className="media-object-spacing-wrapper
          media-object-spacing-narrow"
        >
          <div className="media-object">
            <span className="media-object-item">{label}</span>
            <Tooltip
              content={description}
              interactive={true}
              wrapperClassName="tooltip-wrapper media-object-item"
              wrapText={true}
              maxWidth={300}
            >
              <InfoTooltipIcon />
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
        hidden: currentTab !== formKey,
      });

      const { definition, description, title } = multipleDefinition[formKey];
      const formDefinition = [
        {
          render: this.getHeader.bind(this, title, description),
        },
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
      return <div className={multipleDefinitionClasses}>{panels}</div>;
    }

    return (
      <GeminiScrollbar
        autoshow={true}
        className={multipleDefinitionClasses}
        ref={this.geminiRef}
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

const classPropType = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string,
]);

export default TabForm;
