import { Trans } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import { Hooks } from "#SRC/js/plugin-bridge/PluginSDK";
import * as React from "react";
import { MountService } from "foundation-ui";

import FormErrorUtil from "#SRC/js/utils/FormErrorUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import JSONEditorLoading from "#SRC/js/components/JSONEditorLoading";
import SplitPanel, {
  PrimaryPanel,
  SidePanel,
} from "#SRC/js/components/SplitPanel";
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
  JobOutput,
} from "./form/helpers/JobFormData";
import GeneralFormSection from "./form/GeneralFormSection";
import ContainerFormSection from "./form/ContainerFormSection";
import EnvironmentFormSection from "./form/EnvironmentFormSection";
import RunConfigFormSection from "./form/RunConfigFormSection";
import ScheduleFormSection from "./form/ScheduleFormSection";
import VolumesFormSection from "./form/VolumesFormSection";
import PlacementSection from "./form/PlacementSection";
import {
  jobSpecToOutputParser,
  jobSpecToFormOutputParser,
} from "./form/helpers/JobParsers";
import { translateErrorMessages } from "./form/helpers/ErrorUtil";
import JobErrorTabPathRegexes from "../constants/JobErrorTabPathRegexes";

const ServiceErrorPathMapping: any[] = [];

const JSONEditor = React.lazy(
  () =>
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
  isEdit: boolean;
}

interface JobsFormState {
  editorWidth?: number;
}

interface NavigationItem {
  id: string;
  key: string;
  label: string;
}

const getFormOutput = (jobSpec: JobSpec) =>
  Hooks.applyFilter(
    "jobSpecToFormOutputParser",
    jobSpecToFormOutputParser(jobSpec),
    jobSpec
  );

class JobsForm extends React.Component<JobsFormProps, JobsFormState> {
  public static readonly navigationItems: NavigationItem[] = [
    { id: "general", key: "general", label: i18nMark("General") },
    { id: "container", key: "container", label: i18nMark("Container Runtime") },
    { id: "schedule", key: "schedule", label: i18nMark("Schedule") },
    { id: "environment", key: "environment", label: i18nMark("Environment") },
    { id: "volumes", key: "volumes", label: i18nMark("Volumes") },
    { id: "placement", key: "placement", label: i18nMark("Placement") },
    { id: "runconfig", key: "runConfig", label: i18nMark("Run Configuration") },
  ];

  state = { editorWidth: undefined };
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
    this.onEditorResize = this.onEditorResize.bind(this);
  }

  public getJSONEditorData(jobSpec: JobSpec): JobOutput {
    const jobJSON = jobSpecToOutputParser(jobSpec);
    if (jobJSON.hasOwnProperty("schedule") && jobJSON.schedules === undefined) {
      // jobSpecToOutputParser returns object with `schedule: undefined` if there is no schedule present,
      // but this triggers an update of the JSONEditor and leads to issues where the state of the JSON in the
      // editor is replaced with old values.
      delete jobJSON.schedules;
    }
    return jobJSON;
  }

  public onInputChange({ target: { value, name, type } }) {
    const actionType =
      type === "number" ? JobFormActionType.SetNum : JobFormActionType.Set;

    this.props.onChange({ type: actionType, value, path: name });
  }

  public handleJSONChange(jobJSON: JobOutput) {
    this.props.onChange({
      path: "json",
      type: JobFormActionType.Override,
      value: jobJSON,
    });
  }

  public handleJSONErrorStateChange(errorMessage: string | null) {
    this.props.onErrorsChange(
      errorMessage === null ? [] : [{ message: errorMessage, path: [] }]
    );
  }

  public handleAddItem(path: string) {
    return () => {
      const { onChange } = this.props;
      const action = {
        type: JobFormActionType.AddArrayItem,
        path,
        value: null,
      };

      onChange(action);
    };
  }

  public handleRemoveItem(path: string, index: number) {
    return () => {
      const { onChange } = this.props;
      const action = {
        type: JobFormActionType.RemoveArrayItem,
        path,
        value: index,
      };

      onChange(action);
    };
  }

  public getTabContent() {
    const { jobSpec, errors, showAllErrors, i18n, isEdit } = this.props;
    const formOutput = getFormOutput(jobSpec);
    const translatedErrors = translateErrorMessages(errors, i18n);
    const pluginTabProps = {
      errors: translatedErrors,
      data: formOutput,
      pathMapping: ServiceErrorPathMapping,
      hideTopLevelErrors: !showAllErrors,
      showErrors: showAllErrors,
      onAddItem: this.handleAddItem,
      onRemoveItem: this.handleRemoveItem,
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
          isEdit={isEdit}
          onChange={this.props.onChange}
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
      <TabView id="placement" key="placement">
        <ErrorsAlert
          errors={translatedErrors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <MountService.Mount
          type="CreateJob:PlacementSection"
          formData={formOutput}
          errors={translatedErrors}
          showErrors={showAllErrors}
          onAddItem={this.handleAddItem}
          onRemoveItem={this.handleRemoveItem}
        >
          <PlacementSection
            formData={formOutput}
            errors={translatedErrors}
            showErrors={showAllErrors}
            onAddItem={this.handleAddItem}
            onRemoveItem={this.handleRemoveItem}
          />
        </MountService.Mount>
      </TabView>,
      <TabView id="runconfig" key="runconfig">
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
      </TabView>,
    ];

    return Hooks.applyFilter("createJobTabViews", tabs, pluginTabProps);
  }

  public onEditorResize(newSize: number | undefined) {
    this.setState({ editorWidth: newSize });
  }

  public render() {
    const {
      activeTab,
      handleTabChange,
      isJSONModeActive,
      jobSpec,
      errors,
      i18n,
    } = this.props;
    const errorsByTab = FormErrorUtil.getTopLevelTabErrors(
      errors,
      JobErrorTabPathRegexes,
      ServiceErrorPathMapping,
      i18n
    );
    const jobJSON = this.getJSONEditorData(jobSpec);
    const tabList = Hooks.applyFilter(
      "createJobTabList",
      JobsForm.navigationItems
    ).map((item: NavigationItem) => {
      const issueCount = findNestedPropertyInObject(
        errorsByTab,
        `${item.id}.length`
      );

      return (
        <TabButton
          id={item.id}
          label={<Trans render="span" id={item.label} />}
          key={item.key}
          count={issueCount}
          showErrorBadge={Boolean(issueCount) && this.props.showAllErrors}
          description={
            // TODO: pluralize
            <Trans render="span">{issueCount} issues need addressing</Trans>
          }
        />
      );
    });

    return (
      <SplitPanel onResize={this.onEditorResize}>
        <PrimaryPanel className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
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
        </PrimaryPanel>
        <SidePanel isActive={isJSONModeActive} className="jsonEditorWrapper">
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
              width={
                this.state.editorWidth ? `${this.state.editorWidth}px` : "100%"
              }
            />
          </React.Suspense>
        </SidePanel>
      </SplitPanel>
    );
  }
}

export default withI18n()(JobsForm);
