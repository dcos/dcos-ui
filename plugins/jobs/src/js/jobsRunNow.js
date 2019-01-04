import { take } from "rxjs/operators";

import gql from "graphql-tag";
import { i18nMark } from "@lingui/react";

import { getDataLayer } from "./data/JobModel";

export default function jobsRunNow(jobId) {
  return {
    label: i18nMark("Run Now"),
    async onItemSelect() {
      const dataLayer = await getDataLayer();
      dataLayer
        .query(
          gql`
            mutation {
              runJob(id: $jobId) {
                jobId
              }
            }
          `,
          { jobId }
        )
        // take(1) makes sure the observable is going to complete after finishing
        // the request, so we don't have to care about unsubscribing.
        .pipe(take(1))
        .subscribe();
    }
  };
}
