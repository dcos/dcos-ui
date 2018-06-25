import * as React from "react";

import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { combineLatest } from "rxjs/observable/combineLatest";

import { componentFromStream } from "data-service";

import { createJob, JobData, updateJob } from "#SRC/js/events/MetronomeClient";
import Job from "#SRC/js/structs/Job";

import JobFormModal, { ErrorMessage } from "./components/JobFormModal";

interface JobCreateEditFormModalProps {
  isEdit?: boolean;
  job?: Job;
  open: boolean;
  onClose: () => void;
}

type JobFormModalInput = [JobCreateEditFormModalProps, ErrorMessage];

const JobCreateEditFormModal = componentFromStream<JobCreateEditFormModalProps>(
  props$ => {
    const errorMessage$ = new BehaviorSubject<ErrorMessage>(null);

    function handleErrorMessageChange(errorMessage: ErrorMessage) {
      errorMessage$.next(errorMessage);
    }

    function handleSubmit(isEdit: boolean, jobSpec: JobData, jobId: string) {
      const request$ = isEdit ? updateJob(jobId, jobSpec) : createJob(jobSpec);

      combineLatest(props$, request$)
        .take(1) // unsubscribe after the first one to break ∞ react update loop
        .subscribe({
          next: ([props]) => props.onClose(),
          error: ({ response }) => handleErrorMessageChange(response)
        });
    }

    return combineLatest<JobFormModalInput>([props$, errorMessage$]).map(
      ([props, errorMessage]) => (
        <JobFormModal
          handleCancel={props.onClose}
          handleSubmit={handleSubmit}
          handleErrorMessageChange={handleErrorMessageChange}
          isEdit={props.isEdit || false}
          isOpen={props.open}
          job={props.job || new Job()}
          errorMessage={errorMessage}
        />
      )
    );
  }
);

export default JobCreateEditFormModal;
