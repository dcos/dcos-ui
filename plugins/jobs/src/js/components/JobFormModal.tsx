import Ace from "react-ace";
import * as React from "react";
import { Modal } from "reactjs-components";

import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";

import { DataTriple } from "#SRC/js/components/SchemaForm";
import { Definition, forEachDefinition } from "#SRC/js/utils/FormUtil";
import { cleanJobJSON } from "#SRC/js/utils/CleanJSONUtil";
import { JobData } from "#SRC/js/events/MetronomeClient";
import * as JobSchema from "#SRC/js/schemas/JobSchema";
import * as JobUtil from "#SRC/js/utils/JobUtil";
import * as SchemaUtil from "#SRC/js/utils/SchemaUtil";
import Job from "#SRC/js/structs/Job";
import JobForm from "#SRC/js/components/JobForm";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ToggleButton from "#SRC/js/components/ToggleButton";
import CollapsibleErrorMessage from "#SRC/js/components/CollapsibleErrorMessage";

interface ErrorDetail {
  path: string;
  errors: string[];
}
export type ErrorMessage = null | {
  message: string;
  details?: ErrorDetail[];
};

type FormSubmitCallback = undefined | (() => DataTriple);

interface ResponseMapping {
  [key: string]: string;
}

const serverResponseMappings: ResponseMapping = {
  "error.path.missing": "Specify a path",
  "error.minLength": "Field may not be blank",
  "error.expected.jsnumber": "A number is expected",
  "error.expected.jsstring": "A string is expected"
};

// The values of this map are only used to generate the error strings atm.
// This mapping will make sense when we introduce client-side validation.
const responseAttributePathToFieldIdMap: ResponseMapping = {
  "/id": "id",
  "/description": "description",
  "/run/cpus": "cpus",
  "/run/mem": "mem",
  "/run/disk": "disk",
  "/run/cmd": "cmd",
  "/run/docker/image": "docker/image",
  "/schedules/{INDEX}/id": "schedules/{INDEX}/id",
  "/schedules/{INDEX}/cron": "schedules/{INDEX}/cron",
  "/schedules({INDEX})/cron": "schedules/{INDEX}/cron",
  "/schedules/{INDEX}/concurrencyPolicy": "schedules/{INDEX}/concurrencyPolicy",
  "/schedules/{INDEX}/enabled": "schedules/{INDEX}/enabled",
  "/labels": "labels"
};

interface ModalTitleProps {
  heading: string;
  errorMessage: React.ReactNode;
  handleInputModeToggle: () => void;
  isJsonMode: boolean;
}
interface ModalFooterProps {
  submitLabel: string;
  handleSubmit: () => void;
  handleCancel: () => void;
}

const ModalFooter = ({
  submitLabel,
  handleSubmit,
  handleCancel
}: ModalFooterProps) => {
  return (
    <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-small">
      <button
        className="button button-primary-link flush-left"
        onClick={handleCancel}
      >
        Cancel
      </button>
      <button className="button button-primary" onClick={handleSubmit}>
        {submitLabel}
      </button>
    </div>
  );
};

const ModalTitle = ({
  heading,
  errorMessage,
  handleInputModeToggle,
  isJsonMode
}: ModalTitleProps) => {
  return (
    <div>
      <div className="header-flex">
        <div className="header-left">
          <ModalHeading align="left" level={4}>
            {heading}
          </ModalHeading>
        </div>
        <div className="header-right">
          <ToggleButton
            className="modal-form-title-label flush-bottom"
            checkboxClassName="toggle-button"
            checked={isJsonMode}
            onChange={handleInputModeToggle}
          >
            JSON mode
          </ToggleButton>
        </div>
      </div>
      <div className="header-full-width">{errorMessage}</div>
    </div>
  );
};

interface JobFormModalProps {
  errorMessage: ErrorMessage | null;
  handleCancel: () => void;
  handleErrorMessageChange: (error: ErrorMessage | null) => void;
  handleSubmit: (isEdit: boolean, jobSpec: JobData, jobId: string) => void;
  isEdit: boolean;
  isOpen: boolean;
  job: Job;
}

interface JobFormModalState {
  currentTab: string;
  jobFormModel: object | null;
  jobJsonString: string | null;
  isJsonMode: boolean;
}

export default class JobFormModal extends React.Component<
  JobFormModalProps,
  JobFormModalState
> {
  public static defaultProps: Partial<JobFormModalProps> = {
    isEdit: false,
    job: new Job()
  };
  private triggerFormSubmit: FormSubmitCallback;

  constructor() {
    super();

    this.state = {
      jobFormModel: null,
      jobJsonString: null,
      isJsonMode: false,
      currentTab: ""
    };

    this.triggerFormSubmit = undefined;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleJSONEditorChange = this.handleJSONEditorChange.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleTriggerSubmit = this.handleTriggerSubmit.bind(this);
    this.handleInputModeToggle = this.handleInputModeToggle.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  componentWillReceiveProps(nextProps: JobFormModalProps) {
    if (nextProps.isOpen !== this.props.isOpen) {
      this.resetState();
    }
  }

  handleTabChange(currentTab: string) {
    this.setState({ currentTab });
  }

  handleFormChange(event: { model: object }) {
    if (!event.model) {
      return;
    }

    this.props.handleErrorMessageChange(null);
  }

  handleSubmit() {
    const { isEdit } = this.props;
    const job = this.createJobFromEditorContents();
    if (!job) {
      return;
    }

    const jobSpec = JobUtil.createJobSpecFromJob(job);

    this.props.handleSubmit(isEdit, jobSpec, job.getId());
  }

  handleInputModeToggle() {
    const job = this.createJobFromEditorContents(true) || this.props.job;

    if (this.state.isJsonMode) {
      this.setState(
        {
          jobFormModel: JobUtil.createFormModelFromSchema(JobSchema, job),
          isJsonMode: false
        },
        () => this.props.handleErrorMessageChange(null)
      );
    } else {
      this.setState(
        {
          jobJsonString: JSON.stringify(
            cleanJobJSON(JobUtil.createJobSpecFromJob(job as Job)),
            null,
            2
          ),
          isJsonMode: true
        },
        () => this.props.handleErrorMessageChange(null)
      );
    }
  }

  handleJSONEditorChange(jobJsonString: string) {
    this.setState({ jobJsonString }, () =>
      this.props.handleErrorMessageChange(null)
    );
  }

  handleTriggerSubmit(submitFunction: () => DataTriple) {
    this.triggerFormSubmit = submitFunction;
  }

  resetState() {
    const { job } = this.props;
    this.setState({
      currentTab: "",
      jobFormModel: JobUtil.createFormModelFromSchema(JobSchema, job),
      jobJsonString: JSON.stringify(
        cleanJobJSON(JobUtil.createJobSpecFromJob(job as Job)),
        null,
        2
      )
    });
  }

  createJobFromEditorContents(keepValidationErrors = false) {
    const { jobJsonString, isJsonMode } = this.state;
    let jobDefinition;

    // Try to parse JSON string and detect errors
    try {
      if (typeof jobJsonString !== "string") {
        throw new Error();
      }
      jobDefinition = JSON.parse(jobJsonString);
    } catch (e) {
      this.props.handleErrorMessageChange({
        message: "Invalid JSON syntax",
        details: [{ path: "/", errors: [e.toString()] }]
      });

      return null;
    }

    const job = new Job(jobDefinition);

    if (isJsonMode) {
      // Really hackish way to validate the json string schema, trying to re-use
      // as much code as possible without getting nasty.
      const dummyItemRenderer = () => <div />;

      const formModel = JobUtil.createFormModelFromSchema(JobSchema, job);
      const formMultiDef = SchemaUtil.schemaToMultipleDefinition({
        schema: JobSchema,
        renderSubheader: dummyItemRenderer,
        renderLabel: dummyItemRenderer,
        renderRemove: dummyItemRenderer,
        renderAdd: dummyItemRenderer
      }) as Definition;
      const errorDetails: ErrorDetail[] = [];

      forEachDefinition(formMultiDef, definition => {
        definition.showError = false;

        if (typeof definition.externalValidator === "function") {
          const fieldValidated = definition.externalValidator(
            formModel,
            definition
          );
          if (!fieldValidated) {
            errorDetails.push({
              path: "/",
              errors: [definition.showError.toString()]
            });
          }
        }
      });

      // If we have errors, display them
      if (errorDetails.length) {
        this.props.handleErrorMessageChange({
          message: "There are errors in your JSON definition",
          details: errorDetails
        });

        if (!keepValidationErrors) {
          return null;
        }
      }

      return job;
    }

    // Even though we have our model already in the state, we cannot
    // perform validation on it's data. It's true that `onChange`
    // returns validation information, but that's not the case when the
    // user clicks the `submit` button without changing anything.

    // Therefore we need to ask the SchemaForm to perform validation
    // and return the model once again
    const { model = null, isValidated = false } =
      typeof this.triggerFormSubmit === "function"
        ? this.triggerFormSubmit()
        : {};

    if (!isValidated) {
      this.props.handleErrorMessageChange({
        message: "Please fix all the errors first"
      });
      if (!keepValidationErrors) {
        return null;
      }
    }

    return JobUtil.createJobFromFormModel(model, job.get());
  }

  getErrorMessage() {
    const { errorMessage } = this.props;
    let errorList;

    if (!errorMessage) {
      return null;
    }

    // Stringify error details
    if (errorMessage.details != null) {
      errorList = errorMessage.details.map(({ path, errors }) => {
        let fieldId = "general";

        // See: https://github.com/dcos/metronome/issues/71
        // Check if attributePath contains an index like path(0)/attribute
        // Matches as defined: [0] : '/0/' (or [0] : '(0)'), [1]: '0'
        const matches = path.match(/[/(](\d+)[/)]/);
        if (matches != null) {
          // Keep the separator characters as returned by the server
          // Example: (0), /0/  -> ({INDEX}), /{INDEX}/
          const placeholder = matches[0].replace(/(\d+)/, "{INDEX}");
          const resolvePath =
            responseAttributePathToFieldIdMap[
              path.replace(matches[0], placeholder)
            ];

          if (resolvePath != null) {
            fieldId = resolvePath.replace("{INDEX}", matches[1]);
          }
        } else {
          fieldId = responseAttributePathToFieldIdMap[path] || fieldId;
        }

        errors = errors.map(error => {
          if (serverResponseMappings[error]) {
            return serverResponseMappings[error];
          }

          return error;
        });

        // Return path-prefixed error string
        return `${fieldId}: ${errors}`;
      });
    }

    return (
      <CollapsibleErrorMessage
        className="error-for-modal"
        details={errorList}
        message={errorMessage.message}
      />
    );
  }

  render() {
    const { isEdit, isOpen, job, handleCancel } = this.props;

    const { currentTab, jobFormModel, jobJsonString, isJsonMode } = this.state;

    return (
      <Modal
        backdropClass="modal-backdrop default-cursor"
        modalWrapperClass="multiple-form-modal modal-form"
        open={isOpen}
        scrollContainerClass="multiple-form-modal-body"
        showHeader={true}
        footer={
          <ModalFooter
            submitLabel={isEdit ? "Save Job" : "Create Job"}
            handleSubmit={this.handleSubmit}
            handleCancel={handleCancel}
          />
        }
        header={
          <ModalTitle
            heading={isEdit ? `Edit Job (${job.getName()})` : " New Job"}
            errorMessage={this.getErrorMessage()}
            handleInputModeToggle={this.handleInputModeToggle}
            isJsonMode={isJsonMode}
          />
        }
        showFooter={true}
        useGemini={false}
      >
        {isJsonMode ? (
          <Ace
            editorProps={{ $blockScrolling: true }}
            mode="json"
            onChange={this.handleJSONEditorChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="100%"
            value={jobJsonString}
            width="100%"
          />
        ) : (
          <JobForm
            defaultTab={currentTab}
            onTabChange={this.handleTabChange}
            onChange={this.handleFormChange}
            getTriggerSubmit={this.handleTriggerSubmit}
            model={jobFormModel}
            isEdit={isEdit}
            schema={JobSchema}
          />
        )}
      </Modal>
    );
  }
}
