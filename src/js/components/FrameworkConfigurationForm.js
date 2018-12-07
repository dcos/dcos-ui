import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import PropTypes from "prop-types";
import React, { Component } from "react";
import classNames from "classnames";
import SchemaForm from "react-jsonschema-form";
import { MountService } from "foundation-ui";
import { InfoBoxInline } from "@dcos/ui-kit";

import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import Util from "#SRC/js/utils/Util";
import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import JSONEditor from "#SRC/js/components/JSONEditor";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import PageHeaderNavigationDropdown from "#SRC/js/components/PageHeaderNavigationDropdown";
import UniversePackage from "#SRC/js/structs/UniversePackage";
import CosmosErrorMessage from "#SRC/js/components/CosmosErrorMessage";
import SchemaField from "#SRC/js/components/SchemaField";
import StringUtil from "#SRC/js/utils/StringUtil";
import PlacementConstraintsSchemaField from "#SRC/js/components/PlacementConstraintsSchemaField";
import YamlEditorSchemaField from "#SRC/js/components/YamlEditorSchemaField";
import FrameworkConfigurationConstants from "#SRC/js/constants/FrameworkConfigurationConstants";

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
  "handleFormError",
  "handleJSONChange",
  "handleBadgeClick",
  "validate",
  "jsonSchemaErrorList"
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
    const { formData, handleFocusFieldChange } = this.props;

    const fieldsWithErrors = Object.keys(errorSchema[activeTab]).filter(
      field => {
        return (
          errorSchema[activeTab][field].__errors &&
          errorSchema[activeTab][field].__errors.length > 0
        );
      }
    );

    // first field with errors in the current tab
    const fieldToFocus = Object.keys(formData[activeTab]).find(field => {
      return fieldsWithErrors.includes(field);
    });

    handleFocusFieldChange(activeTab, fieldToFocus);
  }

  getFormTabList() {
    const { formErrors, packageDetails } = this.props;
    const schema = packageDetails.getConfig();

    // the config will have 2-levels, we will render first level as the tabs
    return Object.keys(schema.properties).map(tabName => {
      const issueCount = formErrors[tabName];

      return (
        <TabButton
          label={StringUtil.capitalizeEveryWord(tabName)}
          labelClassName={"padded-right"}
          id={tabName}
          key={tabName}
          showErrorBadge={issueCount > 0}
          count={issueCount}
          description={
            <Trans render="span">{issueCount} issues need addressing</Trans>
          }
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
    if (schema == null) {
      return;
    }
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
      errors.addError(
        schema.default
          ? `Expecting a ${schema.type} here, eg: ${schema.default}`
          : `Expecting a ${schema.type} here`
      );
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
    const { formData } = form;

    this.props.onFormDataChange(formData);

    if (this.props.liveValidate) {
      // When liveValidate is true, errorSchema is available for each change
      this.probeErrorsSchemaForm();
    }
  }

  handleFormError() {
    this.probeErrorsSchemaForm();
  }

  probeErrorsSchemaForm() {
    const { errorSchema } = this.schemaForm.state;

    if (errorSchema) {
      const formErrors = {};
      Object.keys(errorSchema).forEach(tab => {
        formErrors[tab] = this.getTotalErrorsForLevel(errorSchema[tab]);
      });

      this.setState({ errorSchema }, () => {
        this.props.onFormErrorChange(formErrors);
      });
    }
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

  jsonSchemaErrorList(props) {
    return (
      <ErrorsAlert
        errors={props.errors.map(error => {
          return { message: error.stack };
        })}
      />
    );
  }

  render() {
    const {
      packageDetails,
      jsonEditorActive,
      formData,
      activeTab,
      deployErrors,
      defaultConfigWarning,
      onFormSubmit,
      liveValidate,
      submitRef,
      i18n
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

    const schema = packageDetails.getConfig();

    let errorsAlert = null;
    if (deployErrors) {
      errorsAlert = <CosmosErrorMessage error={deployErrors} />;
    }

    let defaultConfigWarningMessage = null;
    if (defaultConfigWarning) {
      defaultConfigWarningMessage = (
        <div className="infoBoxWrapper">
          <InfoBoxInline
            appearance="warning"
            message={
              <div>
                <strong>{i18n._(t`Warning`)}: </strong>
                <Trans id={defaultConfigWarning} render="span" />
              </div>
            }
          />
        </div>
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
                  <TabButtonList>{this.getFormTabList()}</TabButtonList>
                  <div className="menu-tabbed-view-container">
                    {errorsAlert}
                    {defaultConfigWarningMessage}
                    <SchemaForm
                      schema={schema}
                      formData={formData}
                      onChange={this.handleFormChange}
                      onSubmit={onFormSubmit}
                      onError={this.handleFormError}
                      uiSchema={this.getUiSchema()}
                      fields={{ SchemaField, TitleField }}
                      liveValidate={liveValidate}
                      validate={this.validate}
                      ErrorList={this.jsonSchemaErrorList}
                      transformErrors={this.transformErrors}
                      noHtml5Validate={true}
                      ref={form => {
                        this.schemaForm = form;
                      }}
                    >
                      <button ref={submitRef} className="hidden" />
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

FrameworkConfigurationForm.defaultProps = {
  deployErrors: null,
  submitRef: () => {},
  liveValidate: false
};

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
  onFormSubmit: PropTypes.func.isRequired,
  handleActiveTabChange: PropTypes.func.isRequired,
  handleFocusFieldChange: PropTypes.func.isRequired,
  defaultConfigWarning: PropTypes.string,

  // Will be populated with a reference to the form submit button in order
  // to enable the form to be controlled externally
  //
  // See https://github.com/mozilla-services/react-jsonschema-form#tips-and-tricks
  submitRef: PropTypes.func,
  liveValidate: PropTypes.bool
};

export default withI18n()(FrameworkConfigurationForm);
