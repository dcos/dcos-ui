import * as React from "react";
import { deleteJob } from "#SRC/js/events/MetronomeClient";
import { Trans, t } from "@lingui/macro";
import { i18n } from "#SRC/js/i18n";
import { DialogModalWithFooter, PrimaryButton } from "@dcos/ui-kit";
import { Link } from "react-router";

type Props = {
  open: boolean;
  jobId: string;
  onSuccess: () => void;
  onClose: () => void;
};
export default function JobDelete({ open, jobId, onSuccess, onClose }: Props) {
  const [state, setState] = React.useState({ errMsg: null, deleting: false });

  const err = state.errMsg || "";
  const isTaskRunning = err.includes("stopCurrentJobRuns=true");
  const deps = err.match(/children=\[(.+)\]/)?.[1]?.split(",");

  const onConfirm = () =>
    deleteJob(jobId, isTaskRunning).subscribe(
      () => {
        setState({ errMsg: null, deleting: false });
        onSuccess();
      },
      (error) => {
        const errMsg =
          error?.response?.message ||
          `Unknown Metronome Error: ${JSON.stringify(error)}`;
        void setState({ deleting: false, errMsg });
      }
    );

  const ctaDisabled = state.deleting || !!deps?.length;
  return (
    <DialogModalWithFooter
      onClose={onClose}
      isOpen={open}
      title={<Trans id="Delete Job" />}
      ctaButton={
        <PrimaryButton onClick={onConfirm} disabled={ctaDisabled}>
          {state.deleting ? (
            <Trans id="Deleting" />
          ) : isTaskRunning ? (
            <Trans id="Stop Current Runs and Delete Job" />
          ) : (
            <Trans id="Delete Job" />
          )}
        </PrimaryButton>
      }
      closeText={i18n._(t`Cancel`)}
    >
      {isTaskRunning ? (
        <Trans render="p">
          Couldn't delete {jobId} as there are currently active job runs. Do you
          want to stop all runs and delete the job?
        </Trans>
      ) : deps ? (
        <div>
          <Trans render="p">
            Could not delete {jobId} because the following Jobs depend on it:
          </Trans>
          <ul>
            {deps.map((id) => (
              <li key={id}>
                <Link to={`/jobs/detail/${id}`} onClick={onClose}>
                  {id}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : state.errMsg ? (
        state.errMsg
      ) : (
        <Trans render="p">
          Are you sure you want to delete {jobId}? This action is irreversible.
        </Trans>
      )}
    </DialogModalWithFooter>
  );
}
