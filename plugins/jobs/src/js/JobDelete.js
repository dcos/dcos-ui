import * as React from "react";
import { componentFromStream, graphqlObservable } from "@dcos/data-service";
import PropTypes from "prop-types";
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

import JobDeleteModal from "./components/JobDeleteModal";
import defaultSchema from "./data/JobModel";

const deleteJobMutation = gql`
  mutation {
    deleteJob(id: $jobId, stopCurrentJobRuns: $stopCurrentJobRuns) {
      jobId
    }
  }
`;

function executeDeleteMutation({
  jobId,
  stopCurrentJobRuns,
  onSuccess,
  errorMessage
}) {
  return graphqlObservable(deleteJobMutation, defaultSchema, {
    jobId,
    stopCurrentJobRuns
  }).pipe(
    mapTo({ done: true, stopCurrentJobRuns, errorMessage }),
    tap(_ => onSuccess()),
    startWith({ done: false, stopCurrentJobRuns, errorMessage })
  );
}

function deleteEventHandler() {
  const deleteSubject$ = new Subject();
  const delete$ = deleteSubject$.pipe(
    switchMap(executeDeleteMutation),
    catchError(error => {
      return delete$.pipe(
        startWith({
          errorMessage: error && error.response && error.response.message,
          done: true
        })
      );
    })
  );

  return {
    delete$,
    deleteHandler: (jobId, stopCurrentJobRuns, onSuccess, errorMessage) => {
      deleteSubject$.next({
        jobId,
        stopCurrentJobRuns,
        onSuccess,
        errorMessage
      });
    }
  };
}

function isTaskCurrentlyRunning(errorMessage) {
  return (errorMessage || "").includes("stopCurrentJobRuns=true");
}

const JobDelete = componentFromStream(prop$ => {
  const { delete$, deleteHandler } = deleteEventHandler();
  const deleteWithInitialValue$ = delete$.pipe(startWith({ done: null }));

  return prop$.pipe(
    combineLatest(deleteWithInitialValue$, (props, { done, errorMessage }) => {
      return { ...props, done, errorMessage };
    }),
    map(({ open, jobId, onClose, onSuccess, errorMessage, done }) => {
      const stopCurrentJobRuns = isTaskCurrentlyRunning(errorMessage);

      function onSuccessEvent() {
        deleteHandler(jobId, stopCurrentJobRuns, onSuccess, errorMessage);
      }

      return (
        <JobDeleteModal
          jobId={jobId}
          onClose={onClose}
          onSuccess={onSuccessEvent}
          open={open}
          disabled={done === false}
          stopCurrentJobRuns={stopCurrentJobRuns}
        />
      );
    })
  );
});

JobDelete.propTypes = {
  jobId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};

export default JobDelete;
