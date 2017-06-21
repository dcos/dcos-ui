import Ace from "react-ace";
import mixin from "reactjs-mixin";
import { Modal } from "reactjs-components";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";

import CollapsibleErrorMessage from "../CollapsibleErrorMessage";
import { cleanJobJSON } from "../../utils/CleanJSONUtil";
import FormUtil from "../../utils/FormUtil";
import Job from "../../structs/Job";
import JobForm from "../JobForm";
import JobUtil from "../../utils/JobUtil";
import JobSchema from "../../schemas/JobSchema";
import MetronomeStore from "../../stores/MetronomeStore";
import ModalHeading from "../modals/ModalHeading";
import SchemaUtil from "../../utils/SchemaUtil";
import ToggleButton from "../ToggleButton";

const METHODS_TO_BIND = [
  "handleCancel",
  "handleFormChange",
  "handleJSONEditorChange",
  "handleInputModeToggle",
  "handleSubmit",
  "handleTabChange",
  "handleTriggerSubmit",
  "onMetronomeStoreJobCreateSuccess",
  "onMetronomeStoreJobCreateError",
  "onMetronomeStoreJobUpdateSuccess",
  "onMetronomeStoreJobUpdateError"
];

const serverResponseMappings = {
  "error.path.missing": "Specify a path",
  "error.minLength": "Field may not be blank",
  "error.expected.jsnumber": "A number is expected",
  "error.expected.jsstring": "A string is expected"
};

// The values of this map are only used to generate the error strings atm.
// This mapping will make sense when we introduce client-side validation.
const responseAttributePathToFieldIdMap = {
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

class JobFormModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      defaultTab: "",
      errorMessage: null,
      job: new Job(),
      jobFormModel: null,
      jobJsonString: null,
      jsonMode: false
    };

    this.store_listeners = [
      {
        name: "metronome",
        events: [
          "jobCreateSuccess",
          "jobCreateError",
          "jobUpdateSuccess",
          "jobUpdateError"
        ],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.triggerFormSubmit = undefined;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.props.open) {
      this.resetState();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
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

  onMetronomeStoreJobCreateError(errorMessage) {
    this.setState({
      errorMessage
    });
  }

  onMetronomeStoreJobUpdateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMetronomeStoreJobUpdateError(errorMessage) {
    this.setState({
      errorMessage
    });
  }

  resetState() {
    const { job } = this.props;
    this.setState({
      defaultTab: "",
      errorMessage: null,
      jobFormModel: JobUtil.createFormModelFromSchema(JobSchema, job),
      jobJsonString: JSON.stringify(
        cleanJobJSON(JobUtil.createJobSpecFromJob(job)),
        null,
        2
      ),
      jsonMode: false
    });
  }

  createJobFromEditorContents(keepValidationErrors = false) {
    const { jobJsonString, jsonMode } = this.state;
    let jobDefinition = null;

    // Try to parse JSON string and detect errors
    try {
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
      // as much code as possilbe without getting nasty.
      const dummyItemRenderer = function() {
        return <div />;
      };

      const formModel = JobUtil.createFormModelFromSchema(JobSchema, job);
      const formMultiDef = SchemaUtil.schemaToMultipleDefinition({
        schema: JobSchema,
        renderSubheader: dummyItemRenderer,
        renderLabel: dummyItemRenderer,
        renderRemove: dummyItemRenderer,
        renderAdd: dummyItemRenderer
      });
      const errorDetails = [];

      FormUtil.forEachDefinition(formMultiDef, definition => {
        definition.showError = false;

        if (typeof definition.externalValidator !== "function") {
          return null;
        }

        const fieldValidated = definition.externalValidator(
          formModel,
          definition
        );
        if (!fieldValidated) {
          errorDetails.push({
            path: "/",
            errors: [definition.showError]
          });
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
    const { model, isValidated } = this.triggerFormSubmit();

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
          cleanJobJSON(JobUtil.createJobSpecFromJob(job)),
          null,
          2
        ),
        jsonMode: true
      });
    }
  }

  handleFormChange(event) {
    if (!event.model) {
      return;
    }

    this.setState({
      errorMessage: null
    });
  }

  handleJSONEditorChange(jsonDefinition) {
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

  handleTabChange(tab) {
    this.setState({ defaultTab: tab });
  }

  handleTriggerSubmit(submitFunction) {
    this.triggerFormSubmit = submitFunction;
  }

  getErrorMessage() {
    const { errorMessage } = this.state;
    let errorList = null;

    if (!errorMessage) {
      return null;
    }

    // Stringify error details
    if (errorMessage.details != null) {
      errorList = errorMessage.details.map(function({ path, errors }) {
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

        errors = errors.map(function(error) {
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

  getModalContents() {
    const { defaultTab, jobFormModel, jobJsonString, jsonMode } = this.state;

    if (jsonMode) {
      return (
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
      );
    }

    return (
      <JobForm
        defaultTab={defaultTab}
        onTabChange={this.handleTabChange}
        onChange={this.handleFormChange}
        getTriggerSubmit={this.handleTriggerSubmit}
        model={jobFormModel}
        isEdit={this.props.isEdit}
        schema={JobSchema}
      />
    );
  }

  getModalFooter() {
    let submitLabel = "Create Job";
    if (this.props.isEdit) {
      submitLabel = "Save Job";
    }

    return (
      <div className="button-collection flush-bottom">
        <button className="button" onClick={this.handleCancel}>
          Cancel
        </button>
        <button className="button button-success" onClick={this.handleSubmit}>
          {submitLabel}
        </button>
      </div>
    );
  }

  getModalTitle() {
    let heading = " New Job";
    if (this.props.isEdit) {
      heading = `Edit Job (${this.props.job.getName()})`;
    }

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
              checked={this.state.jsonMode}
              onChange={this.handleInputModeToggle}
            >
              JSON mode
            </ToggleButton>
          </div>
        </div>
        <div className="header-full-width">
          {this.getErrorMessage()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <Modal
        backdropClass="modal-backdrop default-cursor"
        modalWrapperClass="multiple-form-modal modal-form"
        open={this.props.open}
        scrollContainerClass="multiple-form-modal-body"
        showHeader={true}
        footer={this.getModalFooter()}
        header={this.getModalTitle()}
        showFooter={true}
        useGemini={false}
      >
        {this.getModalContents()}
      </Modal>
    );
  }
}

JobFormModal.defaultProps = {
  isEdit: false,
  job: new Job(),
  onClose() {},
  open: false
};

JobFormModal.propTypes = {
  isEdit: React.PropTypes.bool,
  job: React.PropTypes.instanceOf(Job),
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = JobFormModal;
