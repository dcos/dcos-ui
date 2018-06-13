import * as React from "react";

import CollapsibleErrorMessage from "#SRC/js/components/CollapsibleErrorMessage";
import { cleanJobJSON } from "#SRC/js/utils/CleanJSONUtil";
import Job from "#SRC/js/structs/Job";
import { Definition, forEachDefinition } from "#SRC/js/utils/FormUtil";
import * as JobUtil from "#SRC/js/utils/JobUtil";
import * as JobSchema from "#SRC/js/schemas/JobSchema";
import { DataTriple } from "#SRC/js/components/SchemaForm";
import MetronomeStore from "#SRC/js/stores/MetronomeStore";
import * as SchemaUtil from "#SRC/js/utils/SchemaUtil";
import {
  METRONOME_JOB_CREATE_ERROR,
  METRONOME_JOB_CREATE_SUCCESS,
  METRONOME_JOB_UPDATE_ERROR,
  METRONOME_JOB_UPDATE_SUCCESS
} from "#SRC/js/constants/EventTypes";

import JobFormModal from "./components/JobFormModal";

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

type FormSubmitCallback = undefined | (() => DataTriple);
interface ErrorDetail {
  path: string;
  errors: string[];
}
type ErrorMessage = null | { message: string; details: null | ErrorDetail[] };

interface JobFormModalContainerState {
  errorMessage: null | ErrorMessage;
  jobFormModel: null | object;
  jobJsonString: null | string;
  jsonMode: boolean;
}

interface JobFormModalContainerProps {
  isEdit?: boolean;
  job?: Job;
  open: boolean;
  onClose: () => void;
}

export default class JobFormModalContainer extends React.Component<
  JobFormModalContainerProps,
  JobFormModalContainerState
> {
  public static defaultProps: Partial<JobFormModalContainerProps> = {
    isEdit: false,
    job: new Job(),
    open: false,
    onClose: () => {} // tslint:disable-line:no-empty
  };
  private triggerFormSubmit: FormSubmitCallback;

  constructor() {
    super(...arguments);

    this.state = {
      errorMessage: null,
      jobFormModel: null,
      jobJsonString: null,
      jsonMode: false
    };

    this.handleCancel = this.handleCancel.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleJSONEditorChange = this.handleJSONEditorChange.bind(this);
    this.handleInputModeToggle = this.handleInputModeToggle.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTriggerSubmit = this.handleTriggerSubmit.bind(this);
    this.onMetronomeStoreJobCreateSuccess = this.onMetronomeStoreJobCreateSuccess.bind(
      this
    );
    this.onMetronomeStoreJobCreateError = this.onMetronomeStoreJobCreateError.bind(
      this
    );
    this.onMetronomeStoreJobUpdateSuccess = this.onMetronomeStoreJobUpdateSuccess.bind(
      this
    );
    this.onMetronomeStoreJobUpdateError = this.onMetronomeStoreJobUpdateError.bind(
      this
    );

    this.triggerFormSubmit = undefined;
  }

  componentWillMount() {
    MetronomeStore.addListener(
      METRONOME_JOB_CREATE_SUCCESS,
      this.onMetronomeStoreJobCreateSuccess
    );
    MetronomeStore.addListener(
      METRONOME_JOB_CREATE_ERROR,
      this.onMetronomeStoreJobCreateError
    );
    MetronomeStore.addListener(
      METRONOME_JOB_UPDATE_SUCCESS,
      this.onMetronomeStoreJobUpdateSuccess
    );
    MetronomeStore.addListener(
      METRONOME_JOB_UPDATE_ERROR,
      this.onMetronomeStoreJobUpdateError
    );
  }

  componentWillUnmount() {
    MetronomeStore.removeListener(
      METRONOME_JOB_CREATE_SUCCESS,
      this.onMetronomeStoreJobCreateSuccess
    );
    MetronomeStore.removeListener(
      METRONOME_JOB_CREATE_ERROR,
      this.onMetronomeStoreJobCreateError
    );
    MetronomeStore.removeListener(
      METRONOME_JOB_UPDATE_SUCCESS,
      this.onMetronomeStoreJobUpdateSuccess
    );
    MetronomeStore.removeListener(
      METRONOME_JOB_UPDATE_ERROR,
      this.onMetronomeStoreJobUpdateError
    );
  }

  componentWillReceiveProps(nextProps: JobFormModalContainerProps) {
    if (nextProps.open !== this.props.open) {
      this.resetState();
    }
  }

  shouldComponentUpdate(
    nextProps: JobFormModalContainerProps,
    nextState: JobFormModalContainerState
  ) {
    const { errorMessage, jsonMode } = this.state;
    const { open } = this.props;

    return (
      nextProps.open !== open ||
      nextState.errorMessage !== errorMessage ||
      nextState.jsonMode !== jsonMode
    );
  }

  onMetronomeStoreJobCreateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMetronomeStoreJobCreateError(errorMessage: ErrorMessage) {
    this.setState({
      errorMessage
    });
  }

  onMetronomeStoreJobUpdateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMetronomeStoreJobUpdateError(errorMessage: ErrorMessage) {
    this.setState({
      errorMessage
    });
  }

  resetState() {
    const { job } = this.props;
    this.setState({
      errorMessage: null,
      jobFormModel: JobUtil.createFormModelFromSchema(JobSchema, job),
      jobJsonString: JSON.stringify(
        cleanJobJSON(JobUtil.createJobSpecFromJob(job as Job)),
        null,
        2
      ),
      jsonMode: false
    });
  }

  createJobFromEditorContents(keepValidationErrors = false) {
    const { jobJsonString, jsonMode } = this.state;
    let jobDefinition;

    // Try to parse JSON string and detect errors
    try {
      if (typeof jobJsonString !== "string") {
        throw new Error();
      }
      jobDefinition = JSON.parse(jobJsonString);
    } catch (e) {
      this.setState({
        errorMessage: {
          message: "Invalid JSON syntax",
          details: [{ path: "/", errors: [e.toString()] }]
        }
      });

      return null;
    }

    const job = new Job(jobDefinition);

    if (jsonMode) {
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
        this.setState({
          errorMessage: {
            message: "There are errors in your JSON definition",
            details: errorDetails
          }
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
      this.setState({
        errorMessage: {
          message: "Please fix all the errors first",
          details: null
        }
      });
      if (!keepValidationErrors) {
        return null;
      }
    }

    return JobUtil.createJobFromFormModel(model, job.get());
  }

  handleCancel() {
    this.props.onClose();
  }

  handleInputModeToggle() {
    const job = this.createJobFromEditorContents(true) || this.props.job;

    if (this.state.jsonMode) {
      this.setState({
        errorMessage: null,
        jobFormModel: JobUtil.createFormModelFromSchema(JobSchema, job),
        jsonMode: false
      });
    } else {
      this.setState({
        errorMessage: null,
        jobJsonString: JSON.stringify(
          cleanJobJSON(JobUtil.createJobSpecFromJob(job as Job)),
          null,
          2
        ),
        jsonMode: true
      });
    }
  }

  handleFormChange(event: { model: object }) {
    if (!event.model) {
      return;
    }

    this.setState({
      errorMessage: null
    });
  }

  handleJSONEditorChange(jsonDefinition: string) {
    this.setState({
      errorMessage: null,
      jobJsonString: jsonDefinition
    });
  }

  handleSubmit() {
    const job = this.createJobFromEditorContents();
    if (!job) {
      return;
    }

    const jobSpec = JobUtil.createJobSpecFromJob(job);

    if (!this.props.isEdit) {
      MetronomeStore.createJob(jobSpec);
    } else {
      MetronomeStore.updateJob(job.getId(), jobSpec);
    }
  }

  handleTriggerSubmit(submitFunction: () => DataTriple) {
    this.triggerFormSubmit = submitFunction;
  }

  getErrorMessage() {
    const { errorMessage } = this.state;
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
    const { jsonMode, jobFormModel, jobJsonString } = this.state;
    const { isEdit, open, job } = this.props;

    return (
      <JobFormModal
        errorMessage={this.getErrorMessage()}
        handleCancel={this.handleCancel}
        handleFormChange={this.handleFormChange}
        handleInputModeToggle={this.handleInputModeToggle}
        handleJSONEditorChange={this.handleJSONEditorChange}
        handleSubmit={this.handleSubmit}
        handleTriggerSubmit={this.handleTriggerSubmit}
        isEdit={isEdit as boolean}
        isOpen={open}
        job={job as Job}
        jobFormModel={jobFormModel}
        jobJsonString={jobJsonString}
        jsonMode={jsonMode}
      />
    );
  }
}
