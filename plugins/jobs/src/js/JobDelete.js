import * as React from "react";
import { componentFromStream } from "data-service";
import PropTypes from "prop-types";
import { deleteJob } from "#SRC/js/events/MetronomeClient";
import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/do";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/catch";

import JobDeleteModal from "./components/JobDeleteModal";

function isTaskCurrentRunning(errorMessage) {
  return /stopCurrentJobRuns=true/.test(errorMessage);
}

function executeDeleteRequest({
  jobId,
  stopCurrentJobRuns,
  onSuccess,
  errorMessage
}) {
  return deleteJob(jobId, stopCurrentJobRuns)
    .mapTo({ done: true, stopCurrentJobRuns, errorMessage })
    .do(_ => onSuccess())
    .startWith({ done: false, stopCurrentJobRuns, errorMessage });
}

function deleteEventHandler() {
  const deleteSubject$ = new Subject();
  const delete$ = deleteSubject$
    .switchMap(executeDeleteRequest)
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

const JobDelete = componentFromStream(prop$ => {
  const { delete$, deleteHandler } = deleteEventHandler();
  const deleteWithInitialValue$ = delete$.startWith({ done: null });

  return prop$
    .combineLatest(deleteWithInitialValue$, (props, { done, errorMessage }) => {
      return { ...props, done, errorMessage };
    })
    .map(({ open, jobId, onClose, onSuccess, errorMessage, done }) => {
      const stopCurrentJobRuns = isTaskCurrentRunning(errorMessage);

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
  disabled: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};

export default JobDelete;
