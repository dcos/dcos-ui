import * as React from "react";

import { BehaviorSubject, combineLatest, Subscribable, Observable } from "rxjs";
import { take, map } from "rxjs/operators";

import gql from "graphql-tag";
import { componentFromStream, graphqlObservable } from "@dcos/data-service";

import { JobData } from "#SRC/js/events/MetronomeClient";
import Job from "#SRC/js/structs/Job";

import JobFormModal, { ErrorMessage } from "./components/JobFormModal";
import defaultSchema from "./data/JobModel";

const createJobMutation = gql`
  mutation {
    createJob(data: $jobSpec) {
      jobId
    }
  }
`;

const updateJobMutation = gql`
  mutation {
    updateJob(id: $jobId, data: $jobSpec) {
      jobId
    }
  }
`;

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

    function handleSubmit(
      isEdit: boolean,
      data: { jobId: string; jobSpec: JobData }
    ) {
      const mutation = isEdit ? updateJobMutation : createJobMutation;

      combineLatest(
        props$ as Subscribable<any>,
        graphqlObservable(mutation, defaultSchema, data) as Observable<any>
      )
        .pipe(take(1)) // unsubscribe after the first one to break ∞ react update loop
        .subscribe({
          next: ([props]) => props.onClose(),
          error: ({ response }) => handleErrorMessageChange(response)
        });
    }

    return combineLatest<JobFormModalInput>([props$, errorMessage$]).pipe(
      map(([props, errorMessage]) => (
        <JobFormModal
          handleCancel={props.onClose}
          handleSubmit={handleSubmit}
          handleErrorMessageChange={handleErrorMessageChange}
          isEdit={props.isEdit || false}
          isOpen={props.open}
          job={props.job || new Job()}
          errorMessage={errorMessage}
        />
      ))
    );
  }
);

export default JobCreateEditFormModal;
