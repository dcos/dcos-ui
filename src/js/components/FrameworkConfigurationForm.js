import React, { Component, PropTypes } from "react";
import classNames from "classnames";
import SchemaForm from "react-jsonschema-form";
import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import Util from "#SRC/js/utils/Util";
import JSONEditor from "#SRC/js/components/JSONEditor";
import PageHeaderNavigationDropdown
  from "#SRC/js/components/PageHeaderNavigationDropdown";
import UniversePackage from "#SRC/js/structs/UniversePackage";
import CosmosErrorMessage from "#SRC/js/components/CosmosErrorMessage";
import SchemaField from "#SRC/js/components/SchemaField";
import StringUtil from "#SRC/js/utils/StringUtil";

const METHODS_TO_BIND = [
  "handleDropdownNavigationSelection",
  "handleTabChange",
  "handleFormChange",
  "validate",
  "handleJSONChange",
  "handleBadgeClick"
];
export default class FrameworkConfigurationForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorSchema: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getFormattedSectionLabel(label) {
    return label
      .toLowerCase()
      .split(/_|-/)
      .map(word => StringUtil.capitalize(word))
      .join(" ");
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

    this.props.onFocusFieldChange(activeTab, fieldToFocus);
  }

  getFormTabList() {
    const { formErrors, formData } = this.props;

    // the config will have 2-levels, we will render first level as the tabs
    return Object.keys(formData).map(tabName => {
      return (
        <TabButton
          label={this.getFormattedSectionLabel(tabName)}
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
    this.props.onActiveTabChange(activeTab);
  }

  handleDropdownNavigationSelection(item) {
    this.props.onActiveTabChange(item.id);
  }

  getDropdownNavigationList() {
    const { formData, activeTab } = this.props;

    return Object.keys(formData).map(tabName => {
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

      return false;
    }

    if (isRequired && formData === "") {
      errors.addError(`Expecting a ${schema.type} here, eg: ${schema.default}`);
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

  // transforms the errors from validating against the JSON schema
  transformErrors(errorSchema) {
    const errorSchemaCopy = [];

    errorSchema.map(error => {
      // remove name: "type" errors because caught by the validate() function
      if (error.name === "type") {
        return;
      }

      // capitalize other errors (ex: regex errors
      error.message = StringUtil.capitalize(error.message);
      errorSchemaCopy.push(error);
    });

    return errorSchemaCopy;
  }

  render() {
    const {
      packageDetails,
      jsonEditorActive,
      formData,
      activeTab,
      deployErrors
    } = this.props;

    // nicely format titles rendered by the json-schema library
    const TitleField = props => {
      return (
        <h2 className="flush-top short-bottom">
          {this.getFormattedSectionLabel(props.title)}
        </h2>
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

    return (
      <div className="flex flex-item-grow-1">
        <PageHeaderNavigationDropdown
          handleNavigationItemSelection={this.handleDropdownNavigationSelection}
          items={this.getDropdownNavigationList()}
        />
        <div className="create-service-modal-form__scrollbar-container modal-body-offset">
          <div className="modal-body-padding-surrogate create-service-modal-form-container">
            <div className="framework-configuration-form create-service-modal-form container container-wide">
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
  focusField: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  deployErrors: PropTypes.object,
  onFormDataChange: PropTypes.func.isRequired,
  onFormErrorChange: PropTypes.func.isRequired,
  onActiveTabChange: PropTypes.func.isRequired,
  onFocusFieldChange: PropTypes.func.isRequired
};
