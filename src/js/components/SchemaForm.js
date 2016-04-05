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

    this.state = {
      currentTab: '',
      useGemini: false
    };

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
    this.setState({useGemini: true});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isMobileWidth !== this.props.isMobileWidth) {
      this.setState({useGemini: false});
    }
  }

  componentDidUpdate() {
    if (!this.state.useGemini) {
      this.setState({useGemini: true});
    }

    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      let {geminiTabs, geminiForms} = this.refs;

      GeminiUtil.updateWithRef(geminiTabs);
      GeminiUtil.updateWithRef(geminiForms);
    });
  }

  handleTabClick(tab) {
    this.setState({currentTab: tab});
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
    return SchemaUtil.schemaToMultipleDefinition(
      this.props.schema, this.getSubHeader, this.getLabel
    );
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
      <div key={name} className="row">
        <div className="h5 column-12 form-row-element flush-bottom flush-top">
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
      <div className="media-object-spacing-wrapper media-object-spacing-narrow flush">
        <div className="media-object media-object-align-middle">
          <div className="media-object-item">
            <div className="icon icon-sprite icon-sprite-medium icon-sprite-medium-color icon-image-container icon-app-container icon-default-gray">
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
    );
  }

  getHeader(title, description) {
    return (
      <div key={title} className="column-12 form-row-element">
        <h3 className="form-header flush-bottom">{title}</h3>
        <p className="flush-bottom">{description}</p>
      </div>
    );
  }

  getSideContent(multipleDefinition) {
    let currentTab = this.state.currentTab;
    let {handleTabClick} = this;
    let isMobileWidth = this.props.isMobileWidth;
    let tabValues = Object.values(multipleDefinition);

    let content = (
      <SideTabs
        isMobileWidth={isMobileWidth}
        onTabClick={handleTabClick}
        selectedTab={currentTab}
        tabs={tabValues} />
    );

    let classSet = classNames({
      'column-4 multiple-form-left-column-container': !isMobileWidth,
      'column-12 mobile-column': isMobileWidth
    });

    if (this.state.useGemini && !isMobileWidth) {
      return (
        <GeminiScrollbar ref="geminiTabs" autoshow={true} className={classSet}>
          <div className="multiple-form-left-column">
            {this.getServiceHeader()}
            {content}
          </div>
        </GeminiScrollbar>
      );
    }

    return (
      <div className={classSet}>
        {this.getServiceHeader()}
        {content}
      </div>
    );
  }

  getFormPanels() {
    let currentTab = this.state.currentTab;
    let multipleDefinition = this.multipleDefinition;
    let formKeys = Object.keys(multipleDefinition);

    let panels = formKeys.map((formKey, i) => {
      let panelClassSet = classNames('form', {
        'hidden': currentTab !== formKey
      });

      let formPanelDefinition = multipleDefinition[formKey];
      let definition = [{render: this.getHeader.bind(
        this,
        formPanelDefinition.title,
        formPanelDefinition.description
      )}].concat(formPanelDefinition.definition);

      return (
        <div key={i} className="row form-panel">
          <Form
            className={panelClassSet}
            definition={definition}
            formGroupClass="form-group flush"
            triggerSubmit={this.getTriggerSubmit.bind(this, formKey)}
            onChange={this.handleFormChange}
            onSubmit={this.handleFormSubmit.bind(this, formKey)} />
        </div>
      );
    });

    let isMobileWidth = this.props.isMobileWidth;
    let classSet = classNames({
      'column-8 multiple-form-right-column': !isMobileWidth,
      'column-12': isMobileWidth
    });

    if (this.state.useGemini) {
      return (
        <GeminiScrollbar ref="geminiForms" autoshow={true} className={classSet}>
          {panels}
        </GeminiScrollbar>
      );
    }

    return (
      <div className={classSet}>
        {panels}
      </div>
    );
  }

  render() {
    let multipleDefinition = this.multipleDefinition;
    let isMobileWidth = this.props.isMobileWidth;

    let classSet = classNames(
      'row row-flex multiple-form',
      this.props.className,
      {'mobile-width': isMobileWidth}
    );

    return (
      <div className={classSet}>
        {this.getSideContent(multipleDefinition)}
        {this.getFormPanels()}
      </div>
    );
  }
}

SchemaForm.defaultProps = {
  className: '',
  getTriggerSubmit: function () {},
  schema: {}
};

SchemaForm.propTypes = {
  isMobileWidth: React.PropTypes.bool,
  getTriggerSubmit: React.PropTypes.func,
  schema: React.PropTypes.object,
  packageIcon: React.PropTypes.string,
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string
};

module.exports = SchemaForm;
