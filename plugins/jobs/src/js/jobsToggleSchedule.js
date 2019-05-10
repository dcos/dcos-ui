import gql from "graphql-tag";
import { i18nMark } from "@lingui/react";
import { take } from "rxjs/operators";
import { DataLayerType } from "@extension-kid/data-layer";

import container from "#SRC/js/container";

const dataLayer = container.get(DataLayerType);

const runUpdateSchedule = gql`
  mutation {
    updateSchedule(id: $jobId, data: $data) {
      jobId
    }
  }
`;

export default function jobsToggleSchedule(job) {
  const [schedule] = job.schedules.nodes;
  const isEnabled = schedule ? schedule.enabled : false;

  const label = isEnabled
    ? i18nMark("Disable Schedule")
    : i18nMark("Enable Schedule");

  const data = Object.assign({}, schedule, { enabled: !isEnabled });

  return {
    label,
    onItemSelect() {
      // take(1) makes sure the observable is going to complete after finishing
      // the request, so we don't have to care about unsubscribing.
      dataLayer
        .query(runUpdateSchedule, {
          jobId: job.id,
          data
        })
        .pipe(take(1))
        .subscribe();
    }
  };
}
