import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import * as React from "react";
import { Confirm } from "reactjs-components";

function modalLabel(jobId, stopCurrentJobRuns) {
  const defaultLabel = i18nMark("Delete Job");

  const stopCurrentRunsLabel = i18nMark("Stop Current Runs and Delete Job");

  return stopCurrentJobRuns ? stopCurrentRunsLabel : defaultLabel;
}

const ModalMessage = ({ jobId, stopCurrentJobRuns }) => {
  const defaultMessage = (
    <Trans render="p">
      Are you sure you want to delete {jobId}? This action is irreversible.
    </Trans>
  );

  const stopCurrentRunsMessage = (
    <Trans render="p">
      Couldn't delete {jobId} as there are currently active job runs. Do you
      want to stop all runs and delete the job?
    </Trans>
  );

  return (
    <div>
      <Trans render="h2" className="text-danger text-align-center flush-top">
        Delete Job
      </Trans>
      {stopCurrentJobRuns ? stopCurrentRunsMessage : defaultMessage}
    </div>
  );
};

const JobDeleteModal = ({
  onClose,
  onSuccess,
  disabled,
  open,
  jobId,
  stopCurrentJobRuns,
  i18n
}) => {
  const label = modalLabel(jobId, stopCurrentJobRuns);

  return (
    <Confirm
      disabled={disabled}
      open={open}
      children={
        <ModalMessage jobId={jobId} stopCurrentJobRuns={stopCurrentJobRuns} />
      }
      leftButtonText={i18n._(t`Cancel`)}
      leftButtonClassName="button button-primary-link"
      leftButtonCallback={onClose}
      rightButtonText={i18n._(label)}
      rightButtonClassName="button button-danger"
      rightButtonCallback={onSuccess}
    />
  );
};
export default withI18n()(JobDeleteModal);
