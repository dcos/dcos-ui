import * as React from "react";
import { Trans } from "@lingui/macro";

import BaseConfig, { Value } from "#SRC/js/components/BaseConfig";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import { JobOutput, JobSchedule } from "../form/helpers/JobFormData";

class ScheduleConfigSection extends BaseConfig<JobOutput> {
  shouldExcludeItem(row: Value<JobOutput>) {
    const { config } = this.props;
    if (config.schedule) {
      const prop = findNestedPropertyInObject(config, row.key);
      return row.key != null && !(prop != null && prop !== "");
    }
    return true;
  }

  getMountType() {
    return "CreateJob:JobConfigDisplay:App:Schedule";
  }

  getDefinition() {
    return {
      tabViewID: "schedule",
      values: [
        {
          heading: <Trans>Schedule</Trans>,
          headingLevel: 1
        },
        {
          key: "schedule.id",
          label: <Trans>Schedule ID</Trans>
        },
        {
          key: "schedule.cron",
          label: <Trans>CRON</Trans>
        },
        {
          key: "schedule.timezone",
          label: <Trans>Timezone</Trans>
        },
        {
          key: "schedule.startingDeadlineSeconds",
          label: <Trans>Starting Deadline</Trans>
        },
        {
          key: "schedule.concurrencyPolicy",
          label: <Trans>Concurrency Policy</Trans>
        },
        {
          key: "schedule.enabled",
          label: <Trans>Enabled</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { schedule } = config;
            return `${
              (schedule as JobSchedule).enabled != null
                ? (schedule as JobSchedule).enabled
                : ""
            }`;
          }
        }
      ]
    };
  }
}

export default ScheduleConfigSection;
