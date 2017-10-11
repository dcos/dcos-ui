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

  handleBadgeClick(activeTab, event) {
    event.stopPropagation();

    const { errorSchema } = this.state;
    const { packageDetails } = this.props;

    const fieldsWithErrors = Object.keys(
      errorSchema[activeTab]
    ).filter(field => {
      return (
        errorSchema[activeTab][field].__errors &&
        errorSchema[activeTab][field].__errors.length > 0
      );
    });

    // first field with errors in the current tab
    const schema = packageDetails.getConfig();
    const fieldToFocus = Object.keys(
      schema.properties[activeTab].properties
    ).find(field => {
      return fieldsWithErrors.includes(field);
    });

    this.props.onFocusFieldChange(activeTab, fieldToFocus);
  }

  getFormTabList() {
    const { packageDetails, formErrors } = this.props;
    const schema = packageDetails.getConfig();

    // the config will have 2-levels, we will render first level as the tabs
    const tabs = Object.keys(schema.properties);

    return tabs.map(tabName => {
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
    const { packageDetails, focusField, activeTab } = this.props;
    const schema = packageDetails.getConfig();

    const uiSchema = {
      [activeTab]: {
        [focusField]: { "ui:autofocus": true }
      }
    };

    // hide all tabs not selected
    Object.keys(schema.properties).forEach(key => {
      if (key !== activeTab) {
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

      return false;
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

  render() {
    const {
      packageDetails,
      jsonEditorActive,
      formData,
      activeTab,
      deployErrors
    } = this.props;
    const schema = packageDetails.getConfig();
    const jsonEditorErrors = this.getErrorsForJSONEditor();

    const TitleField = props => {
      return (
        <DefaultTitleField
          {...props}
          title={this.getFormattedSectionLabel(props.title)}
          required={false}
        />
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
  focusField: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  deployErrors: PropTypes.object,
  onFormDataChange: PropTypes.func.isRequired,
  onFormErrorChange: PropTypes.func.isRequired,
  onActiveTabChange: PropTypes.func.isRequired,
  onFocusFieldChange: PropTypes.func.isRequired
};
