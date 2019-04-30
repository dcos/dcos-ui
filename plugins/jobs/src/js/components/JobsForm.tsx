import { Trans } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import { Hooks } from "#SRC/js/plugin-bridge/PluginSDK";
import classNames from "classnames";
import * as React from "react";

import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import JSONEditorLoading from "#SRC/js/components/JSONEditorLoading";
import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";

import {
  FormError,
  JobFormActionType,
  Action,
  JobSpec,
  JobOutput
} from "./form/helpers/JobFormData";
import GeneralFormSection from "./form/GeneralFormSection";
import ContainerFormSection from "./form/ContainerFormSection";
import EnvironmentFormSection from "./form/EnvironmentFormSection";
import RunConfigFormSection from "./form/RunConfigFormSection";
import ScheduleFormSection from "./form/ScheduleFormSection";
import VolumesFormSection from "./form/VolumesFormSection";
import {
  jobSpecToOutputParser,
  jobSpecToFormOutputParser
} from "./form/helpers/JobParsers";
import { translateErrorMessages } from "./form/helpers/ErrorUtil";

const ServiceErrorPathMapping: any[] = [];

const JSONEditor = React.lazy(() =>
  import(/* webpackChunkName: "jsoneditor" */ "#SRC/js/components/JSONEditor")
);

interface JobsFormProps {
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

class JobsForm extends React.Component<JobsFormProps> {
  static readonly navigationItems: NavigationItem[] = [
    { id: "general", key: "general", label: i18nMark("General") },
    { id: "container", key: "container", label: i18nMark("Container Runtime") },
    { id: "schedule", key: "schedule", label: i18nMark("Schedule") },
    { id: "environment", key: "environment", label: i18nMark("Environment") },
    { id: "volumes", key: "volumes", label: i18nMark("Volumes") },
    { id: "run_config", key: "runConfig", label: i18nMark("Run Configuration") }
  ];

  constructor(props: Readonly<JobsFormProps>) {
    super(props);

    this.onInputChange = this.onInputChange.bind(this);
    this.handleJSONChange = this.handleJSONChange.bind(this);
    this.handleJSONErrorStateChange = this.handleJSONErrorStateChange.bind(
      this
    );
    this.getJSONEditorData = this.getJSONEditorData.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.getFormOutput = this.getFormOutput.bind(this);
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

  onInputChange({ target: { value, name, type, dataset } }: any) {
    const actionType =
      type === "number"
        ? JobFormActionType.SetNum
        : dataset.parser === "boolean"
        ? JobFormActionType.SetBool
        : JobFormActionType.Set;

    this.props.onChange({ type: actionType, value, path: name });
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

  getTabContent() {
    const { jobSpec, errors, showAllErrors, i18n } = this.props;
    const formOutput = this.getFormOutput(jobSpec);
    const translatedErrors = translateErrorMessages(errors, i18n);
    const pluginTabProps = {
      errors: translatedErrors,
      data: formOutput,
      pathMapping: ServiceErrorPathMapping,
      hideTopLevelErrors: !showAllErrors,
      showErrors: showAllErrors,
      onAddItem: this.handleAddItem,
      onRemoveItem: this.handleRemoveItem
    };

    const tabs = [
      <TabView id="general" key="general">
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
      </TabView>,
      <TabView id="container" key="container">
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
      </TabView>,
      <TabView id="schedule" key="schedule">
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
      </TabView>,
      <TabView id="environment" key="environment">
        <ErrorsAlert
          errors={translatedErrors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <EnvironmentFormSection
          formData={formOutput}
          errors={translatedErrors}
          showErrors={showAllErrors}
          onAddItem={this.handleAddItem}
          onRemoveItem={this.handleRemoveItem}
        />
      </TabView>,
      <TabView id="volumes" key="volumes">
        <ErrorsAlert
          errors={translatedErrors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <VolumesFormSection
          formData={formOutput}
          errors={translatedErrors}
          showErrors={showAllErrors}
          onAddItem={this.handleAddItem}
          onRemoveItem={this.handleRemoveItem}
        />
      </TabView>,
      <TabView id="run_config" key="run_config">
        <ErrorsAlert
          errors={translatedErrors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <RunConfigFormSection
          formData={formOutput}
          errors={translatedErrors}
          showErrors={showAllErrors}
          onAddItem={this.handleAddItem}
          onRemoveItem={this.handleRemoveItem}
        />
      </TabView>
    ];

    return Hooks.applyFilter("createJobTabViews", tabs, pluginTabProps);
  }

  getFormOutput(jobSpec: JobSpec) {
    return Hooks.applyFilter(
      "jobSpecToFormOutputParser",
      jobSpecToFormOutputParser(jobSpec),
      jobSpec
    );
  }

  render() {
    const {
      activeTab,
      handleTabChange,
      isJSONModeActive,
      jobSpec,
      errors
    } = this.props;
    const jobJSON = this.getJSONEditorData(jobSpec);
    const tabList = Hooks.applyFilter(
      "createJobTabList",
      JobsForm.navigationItems
    ).map((item: NavigationItem) => (
      <TabButton
        id={item.id}
        label={<Trans render="span" id={item.label} />}
        key={item.key}
      />
    ));

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
                  <TabButtonList>{tabList}</TabButtonList>
                  <TabViewList>{this.getTabContent()}</TabViewList>
                </Tabs>
              </form>
            </div>
          </FluidGeminiScrollbar>
        </div>
        <div className={jsonEditorPlaceholderClasses} />
        <div className={jsonEditorClasses}>
          <React.Suspense fallback={<JSONEditorLoading isSidePanel={true} />}>
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
          </React.Suspense>
        </div>
      </div>
    );
  }
}

export default withI18n()(JobsForm);
