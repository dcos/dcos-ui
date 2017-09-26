import React, { Component, PropTypes } from "react";
import classNames from "classnames";
import DefaultTitleField
  from "react-jsonschema-form/lib/components/fields/TitleField";
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

export default class FrameworkConfigurationForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorSchema: null
    };
  }

  getFormattedSectionLabel(label) {
    return label
      .toLowerCase()
      .split("_")
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  getFirstErrorFieldPath(tabName, errorSchema) {
    const { packageDetails } = this.props;
    const schema = packageDetails.config;

    const fieldsWithErrors = Object.keys(errorSchema[tabName]).filter(field => {
      if (
        errorSchema[tabName][field].__errors &&
        errorSchema[tabName][field].__errors.length > 0
      ) {
        return true;
      }

      return false;
    });

    const fieldToFocus = Object.keys(
      schema.properties[tabName].properties
    ).find(field => {
      return fieldsWithErrors.includes(field);
    });

    return [tabName, fieldToFocus];
  }

  handleBadgeClick(tabName, event) {
    const { errorSchema } = this.state;

    const newFocusFieldPath = this.getFirstErrorFieldPath(tabName, errorSchema);

    this.props.onFocusFieldPathChange(newFocusFieldPath);

    event.stopPropagation();
  }

  getFormTabList() {
    const { packageDetails, formErrors } = this.props;
    const schema = packageDetails.config;

    return Object.keys(schema.properties).map(tabName => {
      return (
        <TabButton
          label={this.getFormattedSectionLabel(tabName)}
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
    const { packageDetails, focusFieldPath } = this.props;
    const schema = packageDetails.config;
    const activeTab = focusFieldPath[0];

    return Object.keys(schema.properties).map(tabName => {
      return {
        id: tabName,
        isActive: activeTab === tabName,
        label: tabName
      };
    });
  }

  getUiSchema() {
    const { packageDetails, focusFieldPath } = this.props;
    const schema = packageDetails.config;

    // focus the field corresponding to keys, ex: ["service", "nodes", "name"]
    const focus = keys => {
      if (keys.length === 0) {
        return {};
      }

      if (keys.length === 1) {
        return { [keys[0]]: { "ui:autofocus": true } };
      }

      return { [keys[0]]: focus(keys.slice(1)) };
    };
    const uiSchema = focus(focusFieldPath);

    // hide all tabs not selected
    Object.keys(schema.properties).forEach(key => {
      if (key !== focusFieldPath[0]) {
        if (uiSchema[key] == null) {
          uiSchema[key] = {};
        }
        uiSchema[key]["classNames"] = "hidden";
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
      errors.addError(`Expecting a ${schema.type} here`);
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

    this.writeErrors(formData, packageDetails.config, false, errors);

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

  render() {
    const {
      packageDetails,
      jsonEditorActive,
      formData,
      focusFieldPath,
      deployErrors
    } = this.props;
    const activeTab = focusFieldPath[0];
    const schema = packageDetails.config;
    const jsonEditorErrors = this.getErrorsForJSONEditor();

    const TitleField = props => {
      return <DefaultTitleField {...props} required={false} />;
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
        <div className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
          <PageHeaderNavigationDropdown
            handleNavigationItemSelection={this.handleDropdownNavigationSelection.bind(
              this
            )}
            items={this.getDropdownNavigationList()}
          />
          <div className="modal-body-padding-surrogate create-service-modal-form-container">
            <div className="create-service-modal-form container container-wide">
              <Tabs
                activeTab={activeTab}
                handleTabChange={this.handleTabChange.bind(this)}
                vertical={true}
                className={"menu-tabbed-container-fixed"}
              >
                <TabButtonList>
                  {this.getFormTabList()}
                </TabButtonList>
                <div className="menu-tabbed-view-container">
                  {errorsAlert}
                  <SchemaForm
                    schema={schema}
                    formData={formData}
                    onChange={this.handleFormChange.bind(this)}
                    uiSchema={this.getUiSchema()}
                    fields={{ SchemaField, TitleField }}
                    liveValidate={true}
                    validate={this.validate.bind(this)}
                    showErrorList={false}
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
            errors={jsonEditorErrors}
            showGutter={true}
            showPrintMargin={false}
            onChange={this.handleJSONChange.bind(this)}
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
  focusFieldPath: PropTypes.array.isRequired,
  deployErrors: PropTypes.object,
  onFormDataChange: PropTypes.func.isRequired,
  onFormErrorChange: PropTypes.func.isRequired,
  onActiveTabChange: PropTypes.func.isRequired,
  onFocusFieldPathChange: PropTypes.func.isRequired
};
