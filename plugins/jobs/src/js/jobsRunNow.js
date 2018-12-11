import "rxjs/add/operator/take";

import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";
import { i18nMark } from "@lingui/react";

import defaultSchema from "./data/JobModel";

const runNowJobMutation = gql`
  mutation {
    runJob(id: $jobId) {
      jobId
    }
  }
`;

export default function jobsRunNow(jobId) {
  return {
    label: i18nMark("Run Now"),
    onItemSelect() {
      // take(1) makes sure the observable is going to complete after finishing
      // the request, so we don't have to care about unsubscribing.
      graphqlObservable(runNowJobMutation, defaultSchema, { jobId })
        .take(1)
        .subscribe();
    }
  };
}
