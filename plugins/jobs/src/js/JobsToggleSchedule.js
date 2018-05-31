/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { graphqlObservable } from "data-service";
import gql from "graphql-tag";

import { Subject } from "rxjs/Subject";
import defaultSchema from "./data/JobModel";

const enableJobMutation = gql`
  mutation {
    updateSchedule(id: $id, data: $data) {
      id
      data
    }
  }
`;

const enableJobGraphql = job => {
  return graphqlObservable(enableJobMutation, defaultSchema, job);
};

const enableJobEvent$ = new Subject();

export const jobsToggleSchedule$ = enableJobEvent$.switchMap(job => {
  return enableJobGraphql(job);
});

export const jobsToggleSchedule = job => {
  if (job == null) {
    return null;
  }

  const [schedule] = job.getSchedules();
  const isEnabled = job.isScheduleEnabled();

  const data = Object.assign({}, schedule, { enabled: !isEnabled });
  const label = isEnabled ? "Disable Schedule" : "Enable Schedule";

  return {
    label,
    onItemSelect() {
      enableJobEvent$.next({
        id: job.getId(),
        data
      });
    }
  };
};
