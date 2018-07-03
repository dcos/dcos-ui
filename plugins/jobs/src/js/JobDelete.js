import * as React from "react";
import { componentFromStream, graphqlObservable } from "data-service";
import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/do";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/catch";

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

function executeDelete({ jobId, stopCurrentJobRuns, onSuccess, errorMsg }) {
  return graphqlObservable(deleteJobMutation, defaultSchema, {
    jobId,
    stopCurrentJobRuns
  })
    .map(_ => ({ done: true, stopCurrentJobRuns, errorMsg }))
    .do(_ => onSuccess())
    .startWith({ done: false, stopCurrentJobRuns, errorMsg });
}

function deleteOperation() {
  const deleteSubject$ = new Subject();
  const delete$ = deleteSubject$.switchMap(executeDelete).catch(error => {
    return delete$.startWith({
      errorMsg: error.response.message,
      done: true
    });
  });

  return {
    delete$,
    deleteHandler: (jobId, stopCurrentJobRuns, onSuccess, errorMsg) => {
      deleteSubject$.next({ jobId, stopCurrentJobRuns, onSuccess, errorMsg });
    }
  };
}

function isTaskCurrentRunning(errorMsg) {
  return /stopCurrentJobRuns=true/.test(errorMsg);
}

const JobDelete = componentFromStream(prop$ => {
  const { delete$, deleteHandler } = deleteOperation();
  const deleteEmit$ = delete$.startWith({ done: null });

  return prop$
    .combineLatest(deleteEmit$, (props, deleteOp) => {
      return { ...props, ...deleteOp };
    })
    .map(({ open, jobId, onClose, onSuccess, errorMsg, done }) => {
      const stopCurrentJobRuns = isTaskCurrentRunning(errorMsg);

      function onSuccessEvent() {
        deleteHandler(jobId, stopCurrentJobRuns, onSuccess, errorMsg);
      }

      return (
        <JobDeleteModal
          onClose={onClose}
          onSuccess={onSuccessEvent}
          disabled={done === false}
          open={open}
          jobId={jobId}
          stopCurrentJobRuns={stopCurrentJobRuns}
        />
      );
    });
});

export default JobDelete;
