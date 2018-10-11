import { Trans } from "@lingui/macro";
import * as React from "react";
import { Confirm } from "reactjs-components";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

function modalLabel(jobId, stopCurrentJobRuns) {
  const defaultLabel = `${StringUtil.capitalize(UserActions.DELETE)} Job`;

  const stopCurrentRunsLabel = `Stop Current Runs and ${StringUtil.capitalize(
    UserActions.DELETE
  )} Job`;

  return stopCurrentJobRuns ? stopCurrentRunsLabel : defaultLabel;
}

const ModalMessage = ({ jobId, stopCurrentJobRuns }) => {
  const defaultMessage = `Are you sure you want to ${
    UserActions.DELETE
  } ${jobId}? This action is irreversible.`;

  const stopCurrentRunsMessage = `Couldn't ${
    UserActions.DELETE
  } ${jobId} as there are currently active job runs. Do you want to stop all runs and ${
    UserActions.DELETE
  } the job?`;

  return (
    <div>
      <Trans render="h2" className="text-danger text-align-center flush-top">
        Delete Job
      </Trans>
      <p>{stopCurrentJobRuns ? stopCurrentRunsMessage : defaultMessage}</p>
    </div>
  );
};

const JobDeleteModal = ({
  onClose,
  onSuccess,
  disabled,
  open,
  jobId,
  stopCurrentJobRuns
}) => {
  const label = modalLabel(jobId, stopCurrentJobRuns);

  return (
    <Confirm
      disabled={disabled}
      open={open}
      children={
        <ModalMessage jobId={jobId} stopCurrentJobRuns={stopCurrentJobRuns} />
      }
      leftButtonText="Cancel"
      leftButtonClassName="button button-primary-link"
      leftButtonCallback={onClose}
      rightButtonText={label}
      rightButtonClassName="button button-danger"
      rightButtonCallback={onSuccess}
    />
  );
};
export default JobDeleteModal;
