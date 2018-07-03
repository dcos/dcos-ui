import * as React from "react";
import { componentFromStream } from "data-service";
import { stopJobRun } from "#SRC/js/events/MetronomeClient";

import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/do";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/catch";

import JobStopRunModal from "./components/JobStopRunModal";

function executeStop({ jobID, jobRun, onSuccess }) {
  return stopJobRun(jobID, jobRun)
    .map(_ => ({ done: true }))
    .do(_ => onSuccess())
    .startWith({ done: false });
}

function stopOperation() {
  const stopSubject$ = new Subject();
  const stop$ = stopSubject$.switchMap(executeStop).catch(error => {
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
  const { stop$, stopHandler } = stopOperation();
  const stopEmit$ = stop$.startWith({ done: null });

  return props$
    .combineLatest(stopEmit$, (props, stopOperation) => {
      return { ...props, ...stopOperation };
    })
    .map(({ jobID, jobRuns, onClose, onSuccess, open, done }) => {
      function onSuccessHandler() {
        stopSingleJobRun(stopHandler, jobID, jobRuns, onSuccess);
      }

      return (
        <JobStopRunModal
          jobID={jobID}
          selectedItems={jobRuns}
          onClose={onClose}
          onSuccess={onSuccessHandler}
          open={open}
          disabled={done === false}
        />
      );
    });
});
