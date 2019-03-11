import { Trans } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import classNames from "classnames";
import * as React from "react";

import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import JSONEditor from "#SRC/js/components/JSONEditor";
import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";

import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";

import {
  FormError,
  JobFormActionType,
  Action,
  JobSpec,
  JobOutput
} from "./form/helpers/JobFormData";
import GeneralFormSection from "./form/GeneralFormSection";
import ContainerFormSection from "./form/ContainerFormSection";
import ScheduleFormSection from "./form/ScheduleFormSection";
import {
  jobSpecToOutputParser,
  jobSpecToFormOutputParser
} from "./form/helpers/JobParsers";
import { translateErrorMessages } from "./form/helpers/ErrorUtil";

const ServiceErrorPathMapping: any[] = [];

interface JobFormProps {
  onChange: (action: Action) => void;
  jobSpec: JobSpec;
  activeTab: string;
  handleTabChange: (tab: string) => void;
  errors: any[];
  isJSONModeActive: boolean;
  onErrorsChange: (errors: FormError[], type?: string) => void;
  showAllErrors: boolean;
  i18n: any;
}

interface NavigationItem {
  id: string;
  key: string;
  label: string;
}

class JobModalForm extends React.Component<JobFormProps> {
  static navigationItems: NavigationItem[] = [
    { id: "general", key: "general", label: i18nMark("General") },
    { id: "container", key: "container", label: i18nMark("Container") },
    { id: "schedule", key: "schedule", label: i18nMark("Schedule") }
  ];

  static tabList = JobModalForm.navigationItems.map(item => (
    <TabButton
      id={item.id}
      label={<Trans render="span" id={item.label} />}
      key={item.key}
    />
  ));

  constructor(props: Readonly<JobFormProps>) {
    super(props);

    this.onInputChange = this.onInputChange.bind(this);
    this.handleJSONChange = this.handleJSONChange.bind(this);
    this.handleJSONErrorStateChange = this.handleJSONErrorStateChange.bind(
      this
    );
    this.getJSONEditorData = this.getJSONEditorData.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
  }

  getJSONEditorData(jobSpec: JobSpec): JobOutput {
    const jobJSON = jobSpecToOutputParser(jobSpec);
    if (jobJSON.hasOwnProperty("schedule") && jobJSON.schedule === undefined) {
      // jobSpecToOutputParser returns object with `schedule: undefined` if there is no schedule present,
      // but this triggers an update of the JSONEditor and leads to issues where the state of the JSON in the
      // editor is replaced with old values.
      delete jobJSON.schedule;
    }
    return jobJSON;
  }

  onInputChange(event: any) {
    const { onChange } = this.props;
    const { value, name, type } = event.target;
    const action = {
      type:
        type === "number" ? JobFormActionType.SetNum : JobFormActionType.Set,
      value,
      path: name
    };
    onChange(action);
  }

  handleJSONChange(jobJSON: JobOutput) {
    this.props.onChange({
      path: "json",
      type: JobFormActionType.Override,
      value: jobJSON
    });
  }

  handleJSONErrorStateChange(errorMessage: string | null) {
    this.props.onErrorsChange(
      errorMessage === null ? [] : [{ message: errorMessage, path: [] }]
    );
  }

  handleClickItem(item: string) {
    this.props.handleTabChange(item);
  }

  handleAddItem(path: string) {
    return () => {
      const { onChange } = this.props;
      const action = {
        type: JobFormActionType.AddArrayItem,
        path,
        value: null
      };

      onChange(action);
    };
  }

  handleRemoveItem(path: string, index: number) {
    return () => {
      const { onChange } = this.props;
      const action = {
        type: JobFormActionType.RemoveArrayItem,
        path,
        value: index
      };

      onChange(action);
    };
  }

  render() {
    const {
      activeTab,
      handleTabChange,
      isJSONModeActive,
      jobSpec,
      errors,
      showAllErrors,
      i18n
    } = this.props;
    const jobJSON = this.getJSONEditorData(jobSpec);
    const formOutput = jobSpecToFormOutputParser(jobSpec);
    const translatedErrors = translateErrorMessages(errors, i18n);

    const jsonEditorPlaceholderClasses = classNames(
      "modal-full-screen-side-panel-placeholder",
      { "is-visible": isJSONModeActive }
    );
    const jsonEditorClasses = classNames("modal-full-screen-side-panel", {
      "is-visible": isJSONModeActive
    });

    return (
      <div className="flex flex-item-grow-1">
        <div className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
          <FluidGeminiScrollbar>
            <div className="modal-body-padding-surrogate create-service-modal-form-container">
              <form
                className="create-service-modal-form container"
                onChange={this.onInputChange}
                noValidate={true}
              >
                <Tabs
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  vertical={true}
                >
                  <TabButtonList>{JobModalForm.tabList}</TabButtonList>
                  <TabViewList>
                    <TabView id="general">
                      <ErrorsAlert
                        errors={translatedErrors}
                        pathMapping={ServiceErrorPathMapping}
                        hideTopLevelErrors={!showAllErrors}
                      />
                      <GeneralFormSection
                        formData={formOutput}
                        errors={translatedErrors}
                        showErrors={showAllErrors}
                      />
                    </TabView>
                    <TabView id="container">
                      <ErrorsAlert
                        errors={translatedErrors}
                        pathMapping={ServiceErrorPathMapping}
                        hideTopLevelErrors={!showAllErrors}
                      />
                      <ContainerFormSection
                        formData={formOutput}
                        errors={translatedErrors}
                        showErrors={showAllErrors}
                        onAddItem={this.handleAddItem}
                        onRemoveItem={this.handleRemoveItem}
                      />
                    </TabView>
                    <TabView id="schedule">
                      <ErrorsAlert
                        errors={translatedErrors}
                        pathMapping={ServiceErrorPathMapping}
                        hideTopLevelErrors={!showAllErrors}
                      />
                      <ScheduleFormSection
                        formData={formOutput}
                        errors={translatedErrors}
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
            value={jobJSON}
            width="100%"
          />
        </div>
      </div>
    );
  }
}

export default withI18n()(JobModalForm);
