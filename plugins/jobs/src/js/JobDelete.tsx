import * as React from "react";
import { componentFromStream } from "@dcos/data-service";
import { Subject } from "rxjs";
import {
  map,
  switchMap,
  tap,
  combineLatest,
  startWith,
  catchError,
  mapTo,
} from "rxjs/operators";

import gql from "graphql-tag";
import { DataLayerType, DataLayer } from "@extension-kid/data-layer";
import container from "#SRC/js/container";

import JobDeleteModal from "./components/JobDeleteModal";

const dataLayer = container.get<DataLayer>(DataLayerType);
const deleteJobMutation = gql`
  mutation {
    deleteJob(id: $jobId, stopCurrentJobRuns: $stopCurrentJobRuns) {
      jobId
    }
  }
`;

const executeDeleteMutation = ({
  jobId,
  stopCurrentJobRuns,
  onSuccess,
  errorMessage,
}) =>
  dataLayer.query(deleteJobMutation, { jobId, stopCurrentJobRuns }).pipe(
    mapTo({ done: true, stopCurrentJobRuns, errorMessage }),
    tap((_) => onSuccess()),
    startWith({ done: false, stopCurrentJobRuns, errorMessage })
  );

type DeleteMutationProps = {
  jobId: string;
  stopCurrentJobRuns: boolean;
  onSuccess: () => void;
  errorMessage: string;
};
function deleteEventHandler() {
  const deleteSubject$ = new Subject<DeleteMutationProps>();
  const delete$ = deleteSubject$.pipe(
    switchMap(executeDeleteMutation),
    catchError((error) =>
      delete$.pipe(
        startWith({
          errorMessage: error && error.response && error.response.message,
          done: true,
        })
      )
    )
  );

  return {
    delete$,
    deleteHandler: (jobId, stopCurrentJobRuns, onSuccess, errorMessage) => {
      deleteSubject$.next({
        jobId,
        stopCurrentJobRuns,
        onSuccess,
        errorMessage,
      });
    },
  };
}

function isTaskCurrentlyRunning(errorMessage) {
  return (errorMessage || "").includes("stopCurrentJobRuns=true");
}

const JobDelete = componentFromStream<{
  jobId: string;
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
}>((prop$) => {
  const { delete$, deleteHandler } = deleteEventHandler();
  const deleteWithInitialValue$ = delete$.pipe(startWith({ done: null }));

  return prop$.pipe(
    combineLatest(deleteWithInitialValue$, (props, { done, errorMessage }) => ({
      ...props,
      done,
      errorMessage,
    })),
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

export default JobDelete;
