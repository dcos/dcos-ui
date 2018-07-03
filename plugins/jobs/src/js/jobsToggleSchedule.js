import { graphqlObservable } from "data-service";
import gql from "graphql-tag";

import defaultSchema from "./data/JobModel";

const runUpdateSchedule = gql`
  mutation {
    updateSchedule(id: $jobId, data: $data) {
      jobId
    }
  }
`;

export default function jobsToggleSchedule(job) {
  const [schedule] = job.schedules;
  const isEnabled = schedule ? schedule.enabled : false;

  const label = isEnabled ? "Disable Schedule" : "Enable Schedule";

  const data = Object.assign({}, schedule, { enabled: !isEnabled });

  return {
    label,
    onItemSelect() {
      // take(1) makes sure the observable is going to complete after finishing
      // the request, so we don't have to care about unsubscribing.
      graphqlObservable(runUpdateSchedule, defaultSchema, {
        jobId: job.id,
        data
      })
        .take(1)
        .subscribe();
    }
  };
}
