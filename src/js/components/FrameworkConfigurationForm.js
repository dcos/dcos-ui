import PropTypes from "prop-types";
import React, { Component } from "react";
import classNames from "classnames";
import SchemaForm from "react-jsonschema-form";
import { MountService } from "foundation-ui";

import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import Util from "#SRC/js/utils/Util";
import JSONEditor from "#SRC/js/components/JSONEditor";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import PageHeaderNavigationDropdown
  from "#SRC/js/components/PageHeaderNavigationDropdown";
import UniversePackage from "#SRC/js/structs/UniversePackage";
import CosmosErrorMessage from "#SRC/js/components/CosmosErrorMessage";
import SchemaField from "#SRC/js/components/SchemaField";
import StringUtil from "#SRC/js/utils/StringUtil";
import PlacementConstraintsSchemaField
  from "#SRC/js/components/PlacementConstraintsSchemaField";
import YamlEditorSchemaField from "#SRC/js/components/YamlEditorSchemaField";
import FrameworkConfigurationConstants
  from "#SRC/js/constants/FrameworkConfigurationConstants";

MountService.MountService.registerComponent(
  PlacementConstraintsSchemaField,
  "SchemaField:application/x-region-zone-constraints+json"
);
MountService.MountService.registerComponent(
  PlacementConstraintsSchemaField,
  "SchemaField:application/x-zone-constraints+json"
);
MountService.MountService.registerComponent(
  YamlEditorSchemaField,
  "SchemaField:application/x-yaml"
);

const METHODS_TO_BIND = [
  "handleDropdownNavigationSelection",
  "handleTabChange",
  "handleFormChange",
  "handleJSONChange",
  "handleBadgeClick",
  "validate"
];
class FrameworkConfigurationForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorSchema: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleBadgeClick(activeTab, event) {
    event.stopPropagation();

    const { errorSchema } = this.state;
    const { formData } = this.props;

    const fieldsWithErrors = Object.keys(
      errorSchema[activeTab]
    ).filter(field => {
      return (
        errorSchema[activeTab][field].__errors &&
        errorSchema[activeTab][field].__errors.length > 0
      );
    });

    // first field with errors in the current tab
    const fieldToFocus = Object.keys(formData[activeTab]).find(field => {
      return fieldsWithErrors.includes(field);
    });

    this.props.handleFocusFieldChange(activeTab, fieldToFocus);
  }

  getFormTabList() {
    const { formErrors, packageDetails } = this.props;
    const schema = packageDetails.getConfig();

    // the config will have 2-levels, we will render first level as the tabs
    return Object.keys(schema.properties).map(tabName => {
      return (
        <TabButton
          label={StringUtil.capitalizeEveryWord(tabName)}
          labelClassName={"padded-right"}
          id={tabName}
          key={tabName}
          showErrorBadge={formErrors[tabName] > 0}
          count={formErrors[tabName]}
          description={`${formErrors[tabName]} issues need addressing`}
          onClickBadge={this.handleBadgeClick.bind(this, tabName)}
        />
      );
    });
  }

  handleTabChange(activeTab) {
    this.props.handleActiveTabChange(activeTab);
  }

  handleDropdownNavigationSelection(item) {
    this.props.handleActiveTabChange(item.id);
  }

  getDropdownNavigationList() {
    const { packageDetails, activeTab } = this.props;
    const schema = packageDetails.getConfig();

    return Object.keys(schema.properties).map(tabName => {
      return {
        id: tabName,
        isActive: activeTab === tabName,
        label: tabName
      };
    });
  }

  getUiSchema() {
    const { formData, focusField, activeTab } = this.props;

    const uiSchema = {
      [activeTab]: {
        [focusField]: { "ui:autofocus": true }
      }
    };

    // hide all tabs not selected
    Object.keys(formData).forEach(tabName => {
      if (tabName !== activeTab) {
        if (uiSchema[tabName] == null) {
          uiSchema[tabName] = {};
        }
        uiSchema[tabName]["classNames"] = "hidden";
      }
    });

    return uiSchema;
  }

  handleJSONChange(formData) {
    this.props.onFormDataChange(formData);
  }

  writeErrors(formData, schema, isRequired, errors) {
    if (Util.isObject(formData)) {
      Object.keys(formData).forEach(property => {
        this.writeErrors(
          formData[property],
          schema.properties[property],
          schema.required && schema.required.includes(property),
          errors[property]
        );
      });

      return;
    }

    if (isRequired && formData === "") {
      let message = `Expecting a ${schema.type} here`;
      if (schema.default) {
        message = `Expecting a ${schema.type} here, eg: ${schema.default}`;
      }
      errors.addError(message);
    }
  }

  getTotalErrorsForLevel(errorSchemaLevel) {
    if (!errorSchemaLevel.__errors) {
      return 0;
    }
    // only show one error per field in badge count
    const currentLevelErrors = errorSchemaLevel.__errors.length > 0 ? 1 : 0;

    return Object.keys(errorSchemaLevel)
      .map(key => this.getTotalErrorsForLevel(errorSchemaLevel[key]))
      .reduce((a, b) => a + b, currentLevelErrors);
  }

  handleFormChange(form) {
    const { formData, errorSchema } = form;

    const formErrors = {};
    Object.keys(errorSchema).forEach(tab => {
      formErrors[tab] = this.getTotalErrorsForLevel(errorSchema[tab]);
    });

    this.props.onFormErrorChange(formErrors);
    this.props.onFormDataChange(formData);
    this.setState({ errorSchema });
  }

  validate(formData, errors) {
    const { packageDetails } = this.props;

    this.writeErrors(formData, packageDetails.getConfig(), false, errors);

    return errors;
  }

  formatErrorForJSON(errorSchema, path) {
    if (!errorSchema.__errors) {
      return [];
    }
    const currentLevelErrors = errorSchema.__errors.map(message => {
      return { message, path };
    });

    return Object.keys(errorSchema)
      .map(key => this.formatErrorForJSON(errorSchema[key], path.concat(key)))
      .reduce((a, b) => a.concat(b), currentLevelErrors);
  }

  getErrorsForJSONEditor() {
    const { errorSchema } = this.state;

    if (!errorSchema) {
      return [];
    }

    return this.formatErrorForJSON(errorSchema, []);
  }

  transformErrors(errorSchema) {
    // Filter "type" errors as they're caught by the validate() function and
    // capitalize error messages
    return errorSchema
      .filter(({ name }) => name !== "type")
      .map(({ message, ...rest }) => {
        return { message: StringUtil.capitalize(message), ...rest };
      });
  }

  render() {
    const {
      packageDetails,
      jsonEditorActive,
      formData,
      activeTab,
      deployErrors,
      defaultConfigWarning
    } = this.props;

    const TitleField = props => {
      const level = props.formContext.level;
      if (level === FrameworkConfigurationConstants.headingLevel.H1) {
        return (
          <h1 className="flush-top short-bottom">
            {StringUtil.capitalizeEveryWord(props.title)}
          </h1>
        );
      }
      if (level === FrameworkConfigurationConstants.headingLevel.H2) {
        return (
          <h2 className="short-bottom">
            {StringUtil.capitalizeEveryWord(props.title)}
          </h2>
        );
      }

      return (
        <h3 className="short-bottom">
          {StringUtil.capitalizeEveryWord(props.title)}
        </h3>
      );
    };

    const jsonEditorPlaceholderClasses = classNames(
      "modal-full-screen-side-panel-placeholder",
      { "is-visible": jsonEditorActive }
    );
    const jsonEditorClasses = classNames("modal-full-screen-side-panel", {
      "is-visible": jsonEditorActive
    });

    let errorsAlert = null;
    if (deployErrors) {
      errorsAlert = <CosmosErrorMessage error={deployErrors} />;
    }

    let defaultConfigWarningMessage = null;
    if (defaultConfigWarning) {
      const message = {};
      message.__html = `<strong>Warning: </strong>${defaultConfigWarning}`;
      defaultConfigWarningMessage = (
        <div
          dangerouslySetInnerHTML={message}
          className="message message-warning"
        />
      );
    }

    return (
      <div className="flex flex-item-grow-1">
        <div className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
          <PageHeaderNavigationDropdown
            handleNavigationItemSelection={
              this.handleDropdownNavigationSelection
            }
            items={this.getDropdownNavigationList()}
          />
          <FluidGeminiScrollbar>
            <div className="modal-body-padding-surrogate create-service-modal-form-container">
              <div className="framework-configuration-form create-service-modal-form container">
                <Tabs
                  activeTab={activeTab}
                  handleTabChange={this.handleTabChange}
                  vertical={true}
                  className={"menu-tabbed-container-fixed"}
                >
                  <TabButtonList>
                    {this.getFormTabList()}
                  </TabButtonList>
                  <div className="menu-tabbed-view-container">
                    {errorsAlert}
                    {defaultConfigWarningMessage}
                    <SchemaForm
                      schema={packageDetails.getConfig()}
                      formData={formData}
                      onChange={this.handleFormChange}
                      uiSchema={this.getUiSchema()}
                      fields={{ SchemaField, TitleField }}
                      liveValidate={true}
                      validate={this.validate}
                      showErrorList={false}
                      transformErrors={this.transformErrors}
                    >
                      <div />
                    </SchemaForm>
                  </div>
                </Tabs>
              </div>
            </div>
          </FluidGeminiScrollbar>
        </div>
        <div className={jsonEditorPlaceholderClasses} />
        <div className={jsonEditorClasses}>
          <JSONEditor
            errors={this.getErrorsForJSONEditor()}
            showGutter={true}
            showPrintMargin={false}
            onChange={this.handleJSONChange}
            theme="monokai"
            height="100%"
            value={formData}
            width="100%"
          />
        </div>
      </div>
    );
  }
}

FrameworkConfigurationForm.propTypes = {
  packageDetails: PropTypes.instanceOf(UniversePackage).isRequired,
  jsonEditorActive: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  formErrors: PropTypes.object.isRequired,
  focusField: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  deployErrors: PropTypes.object,
  onFormDataChange: PropTypes.func.isRequired,
  onFormErrorChange: PropTypes.func.isRequired,
  handleActiveTabChange: PropTypes.func.isRequired,
  handleFocusFieldChange: PropTypes.func.isRequired,
  defaultConfigWarning: PropTypes.string
};

module.exports = FrameworkConfigurationForm;
