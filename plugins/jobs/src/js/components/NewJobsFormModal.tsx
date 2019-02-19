import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import React, { Component } from "react";
import gql from "graphql-tag";
import { graphqlObservable } from "@dcos/data-service";

import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FullScreenModalHeader from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions from "#SRC/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle from "#SRC/js/components/modals/FullScreenModalHeaderTitle";
import DataValidatorUtil from "#SRC/js/utils/DataValidatorUtil";
import ToggleButton from "#SRC/js/components/ToggleButton";

import { getDefaultJobFormData } from "./form/helpers/DefaultFormData";
import { JobFormUIData, FormError } from "./form/helpers/JobFormData";
import { JobResponse } from "src/js/events/MetronomeClient";
import JobForm from "./JobsForm";
import defaultSchema from "../data/JobModel";
import { take } from "rxjs/operators";
import { MetronomeSpecValidators } from "./form/helpers/MetronomeJobValidators";

interface JobFormModalProps {
  job?: JobResponse;
  isEdit: boolean;
  isOpen: boolean;
  closeModal: () => void;
}

interface JobFormModalState {
  formData: JobFormUIData;
  validationErrors: FormError[];
  formJSONErrors: FormError[];
  serverErrors: FormError[];
  formInvalid: boolean;
  processing: boolean;
  confirmOpen: boolean;
  showValidationErrors: boolean;
  activeTab: string;
  isJSONModeActive: boolean;
  submitFailed: boolean;
}

const createJobMutation = gql`
  mutation {
    createJob(data: $data) {
      jobId
    }
  }
`;

const editJobMutation = gql`
  mutation {
    updateJob(id: $jobId, data: $data) {
      jobId
    }
  }
`;

class JobFormModal extends Component<JobFormModalProps, JobFormModalState> {
  constructor() {
    super(...arguments);

    this.state = this.getInitialState();

    this.onChange = this.onChange.bind(this);
    this.handleJSONToggle = this.handleJSONToggle.bind(this);
    this.handleJobRun = this.handleJobRun.bind(this);
    this.getAllErrors = this.getAllErrors.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.handleFormErrorsChange = this.handleFormErrorsChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.getSubmitAction = this.getSubmitAction.bind(this);
  }

  getInitialState() {
    const { job } = this.props;
    const initialFormData = job
      ? this.getFormDataFromJob(job)
      : getDefaultJobFormData();
    const initialState = {
      formData: initialFormData,
      validationErrors: [],
      formJSONErrors: [],
      serverErrors: [],
      processing: false,
      confirmOpen: false,
      isJSONModeActive: false,
      showValidationErrors: false,
      formInvalid: false,
      submitFailed: false,
      activeTab: "general"
    };
    return initialState;
  }

  getFormDataFromJob(job: JobResponse): JobFormUIData {
    const cmdOnly = !(job.run.docker || job.run.ucr);
    const container = (job.run.docker
      ? "docker"
      : job.run.ucr
        ? "ucr"
        : null) as "docker" | "ucr" | null;
    const { schedules, _itemData, ...jobOnly } = job;
    const formData = {
      cmdOnly,
      container,
      job: jobOnly,
      schedule: schedules[0]
    };
    return formData as JobFormUIData;
  }

  onChange(formData: JobFormUIData) {
    // TODO: validate formData to get errors, set error state
    const { submitFailed } = this.state;
    const validationErrors = submitFailed ? this.validateJobSpec(formData) : [];
    this.setState({ formData, validationErrors });
  }

  handleGoBack() {
    const { closeModal } = this.props;
    this.setState(this.getInitialState());
    closeModal();
  }

  handleTabChange(activeTab: string) {
    this.setState({ activeTab });
  }

  handleClose() {
    const { closeModal } = this.props;
    closeModal();
  }

  handleJSONToggle() {
    this.setState({ isJSONModeActive: !this.state.isJSONModeActive });
  }

  getSubmitAction() {
    const { isEdit } = this.props;
    const { formData } = this.state;
    if (isEdit) {
      const editContext = {
        jobId: formData.job.id,
        data: formData
      };
      return graphqlObservable(editJobMutation, defaultSchema, editContext);
    } else {
      const createContext = {
        data: formData
      };
      return graphqlObservable(createJobMutation, defaultSchema, createContext);
    }
  }

  handleJobRun() {
    const { formData } = this.state;
    const { closeModal } = this.props;
    const validationErrors = this.validateJobSpec(formData);
    if (validationErrors.length) {
      this.setState({
        validationErrors,
        showValidationErrors: true,
        submitFailed: true
      });
    } else {
      this.setState({
        validationErrors,
        processing: true,
        submitFailed: false
      });
      this.getSubmitAction()
        .pipe(take(1))
        .subscribe({
          next: () => closeModal(),
          error: e => {
            this.setState({
              processing: false,
              serverErrors: [
                {
                  message:
                    e.response && e.response.message
                      ? e.response.message
                      : e.response
                        ? e.response
                        : e,
                  path: []
                }
              ],
              showValidationErrors: true
            });
          }
        });
    }
  }

  handleFormErrorsChange(errors: FormError[]) {
    this.setState({ formJSONErrors: errors });
  }

  /**
   * This function returns errors produced by the form validators
   */
  validateJobSpec(formData: JobFormUIData) {
    // TODO
    const validationErrors = DataValidatorUtil.validate(
      formData,
      MetronomeSpecValidators
    );

    return validationErrors;
  }

  /**
   * This function combines the errors received from metronome and the errors
   * produced by the form into a unified error array
   */
  getAllErrors(): FormError[] {
    const { serverErrors, formJSONErrors, validationErrors } = this.state;
    return serverErrors.concat(formJSONErrors).concat(validationErrors);
  }

  getHeader() {
    // TODO: This should say edit if the component is given a job to edit
    const { isEdit } = this.props;

    let title = isEdit ? (
      <Trans render="span">Edit Job</Trans>
    ) : (
      <Trans render="span">Create a Job</Trans>
    );

    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions
          actions={this.getSecondaryActions()}
          type="secondary"
        />
        <FullScreenModalHeaderTitle>{title}</FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions
          actions={this.getPrimaryActions()}
          type="primary"
        />
      </FullScreenModalHeader>
    );
  }

  getModalContent() {
    const {
      isJSONModeActive,
      formData,
      showValidationErrors,
      activeTab
    } = this.state;

    return (
      <JobForm
        errors={this.getAllErrors()}
        activeTab={activeTab}
        handleTabChange={this.handleTabChange}
        isJSONModeActive={isJSONModeActive}
        onChange={this.onChange}
        formData={formData}
        showAllErrors={showValidationErrors}
        onErrorsChange={this.handleFormErrorsChange}
      />
    );
  }

  getPrimaryActions() {
    const { processing } = this.state;

    return [
      {
        node: (
          <ToggleButton
            className="flush"
            checkboxClassName="toggle-button toggle-button-align-left"
            checked={this.state.isJSONModeActive}
            onChange={this.handleJSONToggle}
            key="json-editor"
          >
            <Trans render="span">JSON Editor</Trans>
          </ToggleButton>
        )
      },
      {
        className: "button-primary flush-vertical",
        clickHandler: this.handleJobRun,
        label: i18nMark("Submit"),
        disabled: processing
      }
    ];
  }

  getSecondaryActions() {
    return [
      {
        className: "button-primary-link button-flush-horizontal",
        clickHandler: this.handleGoBack,
        label: i18nMark("Cancel")
      }
    ];
  }

  render() {
    const { isOpen } = this.props;
    let useGemini = false;

    return (
      <FullScreenModal
        header={this.getHeader()}
        onClose={this.handleClose}
        useGemini={useGemini}
        open={isOpen}
      >
        {this.getModalContent()}
      </FullScreenModal>
    );
  }
}

export default JobFormModal;
