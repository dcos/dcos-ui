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
import SchemaField from "#SRC/js/components/SchemaField";

export default class FrameworkConfigurationForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: props.activeTab,
      formData: props.formData,
      errorSchema: null,
      tabErrors: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    const { activeTab } = this.state;

    if (!activeTab || nextProps.activeTab !== this.props.activeTab) {
      const activeTab = nextProps.activeTab;
      this.setState({ activeTab });
    }
  }

  getFormattedSectionLabel(label) {
    return label
      .toLowerCase()
      .split("_")
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  getFormTabList() {
    const { packageDetails } = this.props;
    const { tabErrors } = this.state;
    const schema = packageDetails.config;

    const handleBadgeClick = _ => {
      console.log("clicking badge");
    };

    return Object.keys(schema.properties).map(tabName => {
      return (
        <TabButton
          label={this.getFormattedSectionLabel(tabName)}
          id={tabName}
          key={tabName}
          showErrorBadge={tabErrors[tabName] > 0}
          count={tabErrors[tabName]}
          description={`${tabErrors[tabName]} issues need addressing`}
          onClickBadge={handleBadgeClick}
        />
      );
    });
  }

  handleTabChange(activeTab) {
    this.setState({ activeTab });
  }

  handleDropdownNavigationSelection(item) {
    this.setState({ activeTab: item.id });
  }

  getDropdownNavigationList() {
    const { packageDetails } = this.props;
    const { activeTab } = this.state;
    const schema = packageDetails.config;

    return Object.keys(schema.properties).map(tabName => {
      return {
        id: tabName,
        isActive: activeTab === tabName,
        label: tabName
      };
    });
  }

  getUiSchema() {
    const { packageDetails } = this.props;
    const { activeTab } = this.state;
    const schema = packageDetails.config;

    const uiSchema = {};
    Object.keys(schema.properties).forEach(key => {
      if (key !== activeTab) {
        uiSchema[key] = { classNames: "hidden" };
      }
    });

    return uiSchema;
  }

  handleJSONChange(formData) {
    this.setState({ formData });
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
    const currentLevelErrors = errorSchemaLevel.__errors.length;

    return Object.keys(errorSchemaLevel)
      .map(key => this.getTotalErrorsForLevel(errorSchemaLevel[key]))
      .reduce((a, b) => a + b, currentLevelErrors);
  }

  handleFormChange(form) {
    const { formData, errorSchema } = form;

    const tabErrors = {};
    Object.keys(errorSchema).forEach(tab => {
      tabErrors[tab] = this.getTotalErrorsForLevel(errorSchema[tab]);
    });

    this.props.onFormDataChange(formData);
    this.setState({ formData, tabErrors, errorSchema });
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
    const { packageDetails, jsonEditorActive } = this.props;
    const { activeTab, formData } = this.state;

    if (packageDetails == null) {
      return <div>loading</div>;
    }

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
              >
                <TabButtonList>
                  {this.getFormTabList()}
                </TabButtonList>
                <SchemaForm
                  className="menu-tabbed-view-container"
                  schema={schema}
                  formData={formData}
                  onChange={this.handleFormChange.bind(this)}
                  uiSchema={this.getUiSchema()}
                  fields={{ SchemaField, TitleField }}
                  liveValidate={true}
                  validate={this.validate.bind(this)}
                  showErrorList={false}
                  onError={_ => console.log("error happens")}
                >
                  <div />
                </SchemaForm>
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
  onFormDataChange: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired
};
