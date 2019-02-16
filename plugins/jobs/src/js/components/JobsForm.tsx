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

import {
  JobFormUIData,
  FormError,
  JobFormData,
  JobSchedule
} from "../validators/JobFormData";
import { JobFormHistory } from "../validators/JobFormHistory";
import GeneralFormSection from "./GeneralFormSection";
import JobJSONParser from "../validators/JobJSONParser";
import ArgsFormSection from "./ArgsFormSection";

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

interface JobFormState {
  history: JobFormHistory;
}

interface JSONEditorData {
  job: JobFormData;
  schedule: JobSchedule;
}

interface NavigationItem {
  id: string;
  key: string;
  label: string;
  className?: string;
  children?: NavigationItem[];
}

class JobModalForm extends Component<JobFormProps, JobFormState> {
  constructor(props: JobFormProps) {
    super(props);

    this.state = {
      history: new JobFormHistory(props.formData)
    };

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
    dotSeparatedPath: string,
    value: any,
    formData: JobFormUIData
  ) {
    const arrayPath = dotSeparatedPath.split(".");
    const assignProp = arrayPath.pop();
    if (assignProp) {
      arrayPath.reduce((acc: string | object, current: string) => {
        return acc[current];
      }, formData)[assignProp] = value;
    }
  }

  handleFormDataChange(dotSeparatedPath: string, value: any) {
    const { onChange, formData } = this.props;
    const { history } = this.state;
    const newFormData = { ...formData };
    const arrayPath = dotSeparatedPath.split(".");

    // Property that is changing
    const prop = arrayPath[arrayPath.length - 1];

    if (JobJSONParser[prop]) {
      // Check if changed property has complex change rules
      JobJSONParser[prop](value, newFormData, history);
    } else {
      // Default for properties that can be changed simply
      this.handleSimpleValueChange(dotSeparatedPath, value, formData);
    }
    onChange(newFormData);
  }

  onInputChange(event: any) {
    const newValue = event.target.value;
    const inputName = event.target.name;
    this.handleFormDataChange(inputName, newValue);
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

  handleJSONChange(jsonEditorData: JSONEditorData) {
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

  getFormTabList(navigationItems?: NavigationItem[]) {
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
              <form
                className="create-service-modal-form container"
                onChange={this.onInputChange}
              >
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
