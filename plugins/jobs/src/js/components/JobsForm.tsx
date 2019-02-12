import { Trans } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import classNames from "classnames";
import React, { Component } from "react";

import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import JSONEditor from "#SRC/js/components/JSONEditor";
import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";

import { JobFormUIData, FormError } from "../validators/JobFormData";
import GeneralFormSection from "./GeneralFormSection";
import JobJSONParser from "../validators/JobJSONParser";

const ServiceErrorPathMapping: any[] = [];

interface JobFormProps {
  onChange: (formData: JobFormUIData) => void;
  formData: JobFormUIData;
  activeTab: string;
  handleTabChange: (tab: string) => void;
  errors: any[];
  isJSONModeActive: boolean;
  onErrorsChange: (errors: FormError[]) => void;
  showAllErrors: boolean;
}

class JobModalForm extends Component<JobFormProps, object> {
  constructor() {
    super(...arguments);

    this.onInputChange = this.onInputChange.bind(this);
    this.handleFormDataChange = this.handleFormDataChange.bind(this);
    this.handleJSONChange = this.handleJSONChange.bind(this);
    this.handleJSONErrorStateChange = this.handleJSONErrorStateChange.bind(
      this
    );
    this.handleSimpleValueChange = this.handleSimpleValueChange.bind(this);
    this.onChangeArrayItem = this.onChangeArrayItem.bind(this);
    this.onAddItem = this.onAddItem.bind(this);
    this.onRemoveItem = this.onRemoveItem.bind(this);
  }

  handleSimpleValueChange(
    path: string,
    value: any,
    formData: JobFormUIData,
    jobOrSched: "job" | "schedule" = "job"
  ) {
    const splitPath = path.split(".");
    const assignProp = splitPath.pop();
    if (assignProp) {
      splitPath.reduce((acc: string | object, current: string) => {
        return acc[current];
      }, formData[jobOrSched])[assignProp] = value;
    }
  }

  handleFormDataChange(
    path: string,
    value: any,
    jobOrSched?: "job" | "schedule"
  ) {
    const { onChange, formData } = this.props;
    const newFormData = { ...formData };
    const pathNesting = path.split(".");
    const prop = pathNesting[pathNesting.length - 1];
    if (JobJSONParser[prop]) {
      JobJSONParser[prop](value, newFormData);
    } else {
      this.handleSimpleValueChange(path, value, formData, jobOrSched);
    }
    onChange(newFormData);
  }

  onInputChange(inputName: string, jobOrSched?: "job" | "schedule") {
    return (event: any) => {
      const newValue = event.target.value;
      this.handleFormDataChange(inputName, newValue, jobOrSched);
    };
  }

  addArg() {
    const { onChange, formData } = this.props;
    const newFormData = { ...formData };
    if (!newFormData.job.run.args) {
      newFormData.job.run.args = [];
    }
    newFormData.job.run.args.push("");
    onChange(newFormData);
  }

  removeArg(index: number) {
    const { onChange, formData } = this.props;
    const newFormData = { ...formData };
    if (
      !newFormData.job.run.args ||
      newFormData.job.run.args.length - 1 < index
    ) {
      return;
    }
    newFormData.job.run.args.splice(index, 1);
    onChange(newFormData);
  }

  editArg(value: any, index: number) {
    const { onChange, formData } = this.props;
    const newFormData = { ...formData };
    if (
      !newFormData.job.run.args ||
      newFormData.job.run.args.length - 1 < index
    ) {
      return;
    }
    newFormData.job.run.args[index] = value;
    onChange(newFormData);
  }

  onAddItem(addItem: { type: string }) {
    switch (addItem.type) {
      case "args":
        this.addArg();
        break;
    }
  }

  onChangeArrayItem(value: any, type: string, index: number) {
    switch (type) {
      case "args":
        this.editArg(value, index);
        break;
    }
  }

  onRemoveItem(removeItem: { type: string; value: number }) {
    switch (removeItem.type) {
      case "args":
        this.removeArg(removeItem.value);
        break;
    }
  }

  handleJSONChange(jsonEditorData: any) {
    const { formData, onChange } = this.props;
    const newFormData = {
      ...formData,
      ...jsonEditorData
    };
    onChange(newFormData);
  }

  handleJSONErrorStateChange(errorMessage: string) {
    const { onErrorsChange } = this.props;

    if (errorMessage !== null) {
      onErrorsChange([{ message: errorMessage, path: [] }]);
    } else {
      onErrorsChange([]);
    }
  }

  handleClickItem(item: string) {
    this.props.handleTabChange(item);
  }

  getFormNavigationItems() {
    const tabList = [
      { id: "general", key: "general", label: i18nMark("General") }
    ];

    return tabList;
  }

  getFormTabList(navigationItems: any[]) {
    if (navigationItems == null) {
      return null;
    }

    return navigationItems.map(item => {
      return (
        <TabButton
          className={item.className}
          id={item.id}
          label={
            typeof item.label === "string" ? (
              <Trans render="span" id={item.label} />
            ) : (
              item.label
            )
          }
          key={item.key || item.id}
        >
          {this.getFormTabList(item.children)}
        </TabButton>
      );
    });
  }

  render() {
    const {
      activeTab,
      handleTabChange,
      isJSONModeActive,
      formData,
      errors,
      showAllErrors
    } = this.props;
    const { job, schedule } = formData;

    const jsonEditorPlaceholderClasses = classNames(
      "modal-full-screen-side-panel-placeholder",
      { "is-visible": isJSONModeActive }
    );
    const jsonEditorClasses = classNames("modal-full-screen-side-panel", {
      "is-visible": isJSONModeActive
    });

    const navigationItems = this.getFormNavigationItems();
    const tabButtonListItems = this.getFormTabList(navigationItems);

    return (
      <div className="flex flex-item-grow-1">
        <div className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
          <FluidGeminiScrollbar>
            <div className="modal-body-padding-surrogate create-service-modal-form-container">
              <form className="create-service-modal-form container">
                <Tabs
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  vertical={true}
                >
                  <TabButtonList>{tabButtonListItems}</TabButtonList>
                  <TabViewList>
                    <TabView id="general">
                      {showAllErrors && (
                        <ErrorsAlert
                          errors={errors}
                          pathMapping={ServiceErrorPathMapping}
                        />
                      )}
                      <GeneralFormSection
                        onInputChange={this.onInputChange}
                        formData={formData}
                        errors={errors}
                        showErrors={showAllErrors}
                      />
                    </TabView>
                  </TabViewList>
                </Tabs>
              </form>
            </div>
          </FluidGeminiScrollbar>
        </div>
        <div className={jsonEditorPlaceholderClasses} />
        <div className={jsonEditorClasses}>
          <JSONEditor
            errors={errors}
            onChange={this.handleJSONChange}
            onErrorStateChange={this.handleJSONErrorStateChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="100%"
            value={{ job, schedule }}
            width="100%"
          />
        </div>
      </div>
    );
  }
}

export default withI18n()(JobModalForm);
