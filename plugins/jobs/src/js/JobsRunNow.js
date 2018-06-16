/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { graphqlObservable } from "data-service";
import gql from "graphql-tag";
import "rxjs/add/operator/concatMap";

import { Subject } from "rxjs/Subject";
import defaultSchema from "./data/JobModel";

const runNowJobMutation = gql`
  mutation {
    runJob(id: $id) {
      id
    }
  }
`;

const runNowJobGraphql = id => {
  return graphqlObservable(runNowJobMutation, defaultSchema, id);
};

export const runNowEvent$ = new Subject();
export const jobsRunNow$ = runNowEvent$.switchMap(id => {
  return runNowJobGraphql(id);
});

export const jobsRunNowAction = id => {
  return {
    label: "Run Now",
    onItemSelect() {
      runNowJobGraphql(id);
    }
  };
};
