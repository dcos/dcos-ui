import * as React from "react";
import { componentFromStream } from "data-service";
import { stopJobRun } from "#SRC/js/events/MetronomeClient";
import PropTypes from "prop-types";

import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/do";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/catch";

import JobStopRunModal from "./components/JobStopRunModal";

function executeStopRequest({ jobID, jobRun, onSuccess }) {
  return stopJobRun(jobID, jobRun)
    .mapTo({ done: true })
    .do(_ => onSuccess())
    .startWith({ done: false });
}

function stopEventHandler() {
  const stopSubject$ = new Subject();
  const stop$ = stopSubject$.switchMap(executeStopRequest).catch(error => {
    return stop$.startWith({
      errorMsg: error.response.message,
      done: true
    });
  });

  return {
    stop$,
    stopHandler: (jobID, jobRun, onSuccess) => {
      stopSubject$.next({ jobID, jobRun, onSuccess });
    }
  };
}

export function stopSingleJobRun(stopHandler, jobId, jobRuns, onSuccess) {
  // TODO DCOS-8763 introduce support for multiple job run ID
  if (jobRuns.length === 1) {
    stopHandler(jobId, jobRuns[0], onSuccess);
  }
}

export const JobStopRun = componentFromStream(props$ => {
  const { stop$, stopHandler } = stopEventHandler();
  const stopRequestState$ = stop$.startWith({ done: null });

  return props$
    .combineLatest(stopRequestState$, (props, { done }) => {
      return { ...props, done };
    })
    .map(({ jobID, jobRuns, onClose, onSuccess, open, done }) => {
      function onSuccessHandler() {
        stopSingleJobRun(stopHandler, jobID, jobRuns, onSuccess);
      }

      return (
        <JobStopRunModal
          jobID={jobID}
          onClose={onClose}
          onSuccess={onSuccessHandler}
          open={open}
          disabled={done === false}
          selectedItems={jobRuns}
        />
      );
    });
});

JobStopRun.propTypes = {
  jobID: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};
