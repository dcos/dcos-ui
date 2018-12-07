import * as React from "react";
import PropTypes from "prop-types";

import { componentFromStream, graphqlObservable } from "@dcos/data-service";
import { Subject } from "rxjs";
import {
  map,
  switchMap,
  tap,
  combineLatest,
  startWith,
  catchError,
  mapTo
} from "rxjs/operators";
import gql from "graphql-tag";

import JobStopRunModal from "./components/JobStopRunModal";

import defaultSchema from "./data/JobModel";

const stopJobRunMutation = gql`
  mutation {
    stopJobRun(id: $jobId, jobRunId: $jobRunId) {
      jobId
    }
  }
`;

function executeStopJobRunMutation({ jobId, jobRunId, onSuccess }) {
  return graphqlObservable(stopJobRunMutation, defaultSchema, {
    jobId,
    jobRunId
  }).pipe(
    mapTo({ done: true }),
    tap(_ => onSuccess()),
    startWith({ done: false })
  );
}

function stopEventHandler() {
  const stopSubject$ = new Subject();
  const stop$ = stopSubject$.pipe(
    switchMap(executeStopJobRunMutation),
    catchError(error => {
      return stop$.pipe(
        startWith({
          errorMessage: error && error.response && error.response.message,
          done: true
        })
      );
    })
  );

  return {
    stop$,
    stopHandler: (jobId, jobRunId, onSuccess) => {
      stopSubject$.next({ jobId, jobRunId, onSuccess });
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
  const stopRequestState$ = stop$.pipe(startWith({ done: null }));

  return props$.pipe(
    combineLatest(stopRequestState$, (props, { done }) => {
      return { ...props, done };
    }),
    map(({ jobID, jobRuns, onClose, onSuccess, open, done }) => {
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
    })
  );
});

JobStopRun.propTypes = {
  jobID: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};
