import { Trans, t } from "@lingui/macro";
import { withI18n, i18nMark } from "@lingui/react";
import * as React from "react";
import { Hooks } from "#SRC/js/plugin-bridge/PluginSDK";
import gql from "graphql-tag";
import { DataLayerType, DataLayer } from "@extension-kid/data-layer";
import { take } from "rxjs/operators";
// @ts-ignore
import { Confirm } from "reactjs-components";
import isEqual from "lodash/isEqual";

import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FullScreenModalHeader from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions from "#SRC/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle from "#SRC/js/components/modals/FullScreenModalHeaderTitle";
import DataValidatorUtil from "#SRC/js/utils/DataValidatorUtil";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ToggleButton from "#SRC/js/components/ToggleButton";
import { deepCopy } from "#SRC/js/utils/Util";
import container from "#SRC/js/container";

import {
  getDefaultJobSpec,
  getDefaultContainer,
  getDefaultDocker
} from "./form/helpers/DefaultFormData";
import {
  FormError,
  JobSpec,
  JobOutput,
  Action,
  Container,
  JobAPIOutput
} from "./form/helpers/JobFormData";
import { JobResponse } from "src/js/events/MetronomeClient";
import JobForm from "./JobsForm";
import {
  MetronomeSpecValidators,
  validateSpec
} from "./form/helpers/MetronomeJobValidators";
import {
  jobSpecToOutputParser,
  removeBlankProperties
} from "./form/helpers/JobParsers";
import { jobFormOutputToSpecReducer } from "./form/reducers/JobReducers";

import UserSettingsStore from "#SRC/js/stores/UserSettingsStore";

interface JobFormModalProps {
  job?: JobResponse;
  isEdit: boolean;
  isOpen: boolean;
  closeModal: () => void;
  i18n: any;
}

interface JobFormModalState {
  jobOutput: JobOutput;
  jobSpec: JobSpec;
  hasSchedule: boolean; // Whether the original job has a schedule or not, so that we know whether to PUT or POST a schedule if added
  scheduleFailure: boolean;
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
  isConfirmOpen: boolean;
}

const dataLayer = container.get<DataLayer>(DataLayerType);
const createJobMutation = gql`
  mutation {
    createJob(data: $data) {
      jobId
    }
  }
`;

const editJobMutation = gql`
  mutation {
    updateJob(id: $jobId, data: $data, existingSchedule: $existingSchedule) {
      jobId
    }
  }
`;

class JobFormModal extends React.Component<
  JobFormModalProps,
  JobFormModalState
> {
  constructor(props: JobFormModalProps) {
    super(props);

    this.state = this.getInitialState();

    this.onChange = this.onChange.bind(this);
    this.handleJSONToggle = this.handleJSONToggle.bind(this);
    this.handleJobRun = this.handleJobRun.bind(this);
    this.getAllErrors = this.getAllErrors.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleFormErrorsChange = this.handleFormErrorsChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.getSubmitAction = this.getSubmitAction.bind(this);
    this.getErrorMessage = this.getErrorMessage.bind(this);
    this.confirmClose = this.confirmClose.bind(this);
    this.handleCancelClose = this.handleCancelClose.bind(this);
    this.validateSpec = this.validateSpec.bind(this);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: JobFormModalProps) {
    if (!isEqual(nextProps.job, this.props.job)) {
      const jobSpec = nextProps.job
        ? this.getJobSpecFromResponse(nextProps.job)
        : getDefaultJobSpec();
      this.setState({ jobSpec });
    }
  }

  public shouldComponentUpdate(
    nextProps: JobFormModalProps,
    nextState: JobFormModalState
  ) {
    const { job, isOpen } = this.props;

    if (nextState !== this.state) {
      return true;
    }

    if (
      ((nextProps.job || job) && nextProps.job === job) ||
      nextProps.isOpen === isOpen
    ) {
      return false;
    }

    return true;
  }

  public getInitialState() {
    const { job } = this.props;
    const jobSpec = job
      ? this.getJobSpecFromResponse(job)
      : getDefaultJobSpec();
    const hasSchedule = !!(jobSpec.job.schedules && jobSpec.job.schedules[0]);
    const jobOutput = jobSpecToOutputParser(jobSpec);
    return {
      jobSpec,
      jobOutput,
      hasSchedule,
      scheduleFailure: false,
      validationErrors: [],
      formJSONErrors: [],
      serverErrors: [],
      processing: false,
      confirmOpen: false,
      isJSONModeActive: UserSettingsStore.JSONEditorExpandedSetting,
      showValidationErrors: false,
      formInvalid: false,
      submitFailed: false,
      activeTab: "general",
      isConfirmOpen: false
    };
  }

  public getJobSpecFromResponse(job: JobResponse): JobSpec {
    const jobCopy = deepCopy(job);
    const cmdOnly = !(jobCopy.run.docker || jobCopy.run.ucr);
    const container = jobCopy.run.docker ? Container.Docker : Container.UCR;

    if (jobCopy.run.ucr) {
      jobCopy.run.docker = getDefaultDocker();
      jobCopy.run.docker.image =
        jobCopy.run.ucr.image && jobCopy.run.ucr.image.id;
      jobCopy.run.docker.forcePullImage =
        jobCopy.run.ucr.image && jobCopy.run.ucr.image.forcePull;
    } else if (jobCopy.run.docker) {
      jobCopy.run.ucr = getDefaultContainer();
      jobCopy.run.ucr.image.id = jobCopy.run.docker.image;
      jobCopy.run.ucr.image.forcePull = jobCopy.run.docker.forcePullImage;
    } else {
      jobCopy.run.docker = getDefaultDocker();
      jobCopy.run.ucr = getDefaultContainer();
    }

    if (jobCopy.labels) {
      jobCopy.labels = Object.entries(jobCopy.labels);
    }

    if (jobCopy.run.env) {
      jobCopy.run.env = Object.entries(jobCopy.run.env);
    }

    const { _itemData, ...jobOnly } = jobCopy;
    const jobSpec = {
      cmdOnly,
      container,
      job: jobOnly
    };
    return Hooks.applyFilter("jobResponseToSpecParser", jobSpec);
  }

  public onChange(action: Action) {
    const { submitFailed, jobSpec } = this.state;
    const newJobSpec = jobFormOutputToSpecReducer(action, jobSpec);
    const specErrors = this.validateSpec(newJobSpec);
    const outputErrors = this.validateJobOutput(
      jobSpecToOutputParser(newJobSpec)
    );
    const validationErrors = submitFailed
      ? outputErrors.concat(specErrors)
      : [];
    this.setState({ jobSpec: newJobSpec, validationErrors });
  }

  public handleTabChange(activeTab: string) {
    this.setState({ activeTab });
  }

  public handleClose() {
    const { closeModal } = this.props;
    closeModal();
    this.setState(this.getInitialState());
  }

  public handleCancelClose() {
    this.setState({ isConfirmOpen: false });
  }

  public confirmClose() {
    this.setState({ isConfirmOpen: true });
  }

  public handleJSONToggle() {
    UserSettingsStore.setJSONEditorExpandedSetting(
      !this.state.isJSONModeActive
    );
    this.setState({ isJSONModeActive: !this.state.isJSONModeActive });
  }

  public getSubmitAction(jobOutput: JobOutput) {
    const { isEdit } = this.props;
    const { hasSchedule, scheduleFailure } = this.state;
    const data: JobAPIOutput = {
      job: jobOutput
    };
    if (jobOutput.schedules) {
      data.schedule = jobOutput.schedules[0];
      delete jobOutput.schedules;
    }
    if (isEdit || scheduleFailure) {
      const editContext = {
        jobId: jobOutput.id,
        data,
        existingSchedule: hasSchedule
      };
      return dataLayer.query(editJobMutation, editContext);
    }
    {
      const createContext = {
        data
      };
      return dataLayer.query(createJobMutation, createContext);
    }
  }

  public getErrorMessage(err: any) {
    if (err.response && err.response.details && err.response.details.length) {
      return err.response.details.map(
        (e: { path: string; errors: string[]; type?: string }) => {
          // Error message will be specific to either the job or the schedule, so we need to
          // prefix the given path with `job` or `schedule` to give the error messages the correct
          // visibility.
          const prefix = err.type === "SCHEDULE" ? "schedule" : "job";

          // The path from the server error will look like ex `\/run\/gpus` so splitting on "\/"
          // will give the correct array path.
          const path = [prefix].concat(
            // Linter does not like `\` but it is necessary here.
            // tslint:disable-next-line:prettier
            e.path.split("/").filter(pathSegment => pathSegment !== "")
          );
          return {
            path,
            message: e.errors.join(" ")
          };
        }
      );
    }
    {
      const message =
        err.response && err.response.message
          ? err.response.message
          : err.response
          ? err.response
          : err;
      return [
        {
          path: [],
          message
        }
      ];
    }
  }

  public validateSpec(jobSpec: JobSpec): FormError[] {
    return Hooks.applyFilter(
      "jobsValidateSpec",
      validateSpec(jobSpec),
      jobSpec
    );
  }

  public handleJobRun() {
    const { jobSpec, formJSONErrors } = this.state;

    const jobOutput = removeBlankProperties(jobSpecToOutputParser(jobSpec));
    const validationErrors = this.validateJobOutput(jobOutput).concat(
      this.validateSpec(jobSpec)
    );
    const totalErrors = validationErrors.concat(formJSONErrors);
    if (totalErrors.length) {
      this.setState({
        validationErrors,
        showValidationErrors: true,
        submitFailed: true
      });
    } else {
      this.setState({
        validationErrors,
        processing: true,
        submitFailed: false,
        jobOutput
      });
      this.getSubmitAction(jobOutput)
        .pipe(take(1))
        .subscribe({
          next: () => this.handleClose(),
          error: e => {
            if (e.type === "SCHEDULE") {
              this.setState({
                scheduleFailure: true,
                processing: false,
                serverErrors: this.getErrorMessage(e),
                showValidationErrors: true
              });
            } else {
              this.setState({
                processing: false,
                serverErrors: this.getErrorMessage(e),
                showValidationErrors: true
              });
            }
          }
        });
    }
  }

  public handleFormErrorsChange(errors: FormError[]) {
    this.setState({ formJSONErrors: errors });
  }

  /**
   * This function returns errors produced by the form validators
   */
  public validateJobOutput(jobOutput: JobOutput) {
    return DataValidatorUtil.validate(
      jobOutput,
      Object.values(
        Hooks.applyFilter("metronomeValidators", MetronomeSpecValidators)
      )
    );
  }

  /**
   * This function combines the errors received from metronome and the errors
   * produced by the form into a unified error array
   */
  public getAllErrors(): FormError[] {
    const { serverErrors, formJSONErrors, validationErrors } = this.state;
    return serverErrors.concat(formJSONErrors).concat(validationErrors);
  }

  public getHeader() {
    // TODO: This should say edit if the component is given a job to edit
    const { isEdit } = this.props;
    const { scheduleFailure } = this.state;

    const title =
      isEdit || scheduleFailure ? (
        <Trans render="span">Edit Job</Trans>
      ) : (
        <Trans render="span">New Job</Trans>
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

  public getModalContent() {
    const {
      isJSONModeActive,
      jobSpec,
      showValidationErrors,
      activeTab
    } = this.state;

    const { isEdit } = this.props;

    return (
      <JobForm
        errors={this.getAllErrors()}
        activeTab={activeTab}
        handleTabChange={this.handleTabChange}
        isJSONModeActive={isJSONModeActive}
        onChange={this.onChange}
        jobSpec={jobSpec}
        showAllErrors={showValidationErrors}
        onErrorsChange={this.handleFormErrorsChange}
        isEdit={isEdit}
      />
    );
  }

  public getPrimaryActions() {
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
        label: processing ? i18nMark("Submitting...") : i18nMark("Submit"),
        disabled: processing
      }
    ];
  }

  public getSecondaryActions() {
    return [
      {
        className: "button-primary-link button-flush-horizontal",
        clickHandler: this.confirmClose,
        label: i18nMark("Cancel")
      }
    ];
  }

  public render() {
    const { isOpen, i18n } = this.props;
    const { isConfirmOpen } = this.state;
    const useGemini = false;

    return (
      <FullScreenModal
        header={this.getHeader()}
        onClose={this.handleClose}
        useGemini={useGemini}
        open={isOpen}
      >
        {this.getModalContent()}
        <Confirm
          closeByBackdropClick={true}
          header={
            <ModalHeading>
              <Trans render="span">Discard Changes?</Trans>
            </ModalHeading>
          }
          open={isConfirmOpen}
          leftButtonText={i18n._(t`Cancel`)}
          leftButtonClassName="button button-primary-link flush-left"
          leftButtonCallback={this.handleCancelClose}
          rightButtonText={i18n._(t`Discard`)}
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleClose}
          showHeader={true}
        >
          <Trans render="p">
            Are you sure you want to leave this page? Any data you entered will{" "}
            be lost.
          </Trans>
        </Confirm>
      </FullScreenModal>
    );
  }
}

export default withI18n()(JobFormModal);
