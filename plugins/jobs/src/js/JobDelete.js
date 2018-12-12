import * as React from "react";
import { componentFromStream, graphqlObservable } from "@dcos/data-service";
import PropTypes from "prop-types";
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

function executeDeleteMutation({
  jobId,
  stopCurrentJobRuns,
  onSuccess,
  errorMessage
}) {
  return graphqlObservable(deleteJobMutation, defaultSchema, {
    jobId,
    stopCurrentJobRuns
  })
    .mapTo({ done: true, stopCurrentJobRuns, errorMessage })
    .do(_ => onSuccess())
    .startWith({ done: false, stopCurrentJobRuns, errorMessage });
}

function deleteEventHandler() {
  const deleteSubject$ = new Subject();
  const delete$ = deleteSubject$
    .switchMap(executeDeleteMutation)
    .catch(error => {
      return delete$.startWith({
        errorMessage: error && error.response && error.response.message,
        done: true
      });
    });

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
  const deleteWithInitialValue$ = delete$.startWith({ done: null });

  return prop$
    .combineLatest(deleteWithInitialValue$, (props, { done, errorMessage }) => {
      return { ...props, done, errorMessage };
    })
    .map(({ open, jobId, onClose, onSuccess, errorMessage, done }) => {
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
    });
});

JobDelete.propTypes = {
  jobId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};

export default JobDelete;
