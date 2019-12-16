import * as React from "react";
import { Trans } from "@lingui/macro";

import BaseConfig, { Value } from "#SRC/js/components/BaseConfig";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { getDisplayValue } from "#SRC/js/utils/ConfigDisplayUtil";

import { JobOutput } from "../form/helpers/JobFormData";

class ScheduleConfigSection extends BaseConfig<JobOutput> {
  public shouldExcludeItem(row: Value<JobOutput>) {
    const { config } = this.props;
    if (config.schedules && config.schedules[0]) {
      const prop = findNestedPropertyInObject(config.schedules[0], row.key);
      return row.key != null && !(prop != null && prop !== "");
    }
    return true;
  }

  public getMountType() {
    return "CreateJob:JobConfigDisplay:App:Schedule";
  }

  public getDefinition() {
    return {
      tabViewID: "schedule",
      values: [
        {
          heading: <Trans>Schedule</Trans>,
          headingLevel: 1
        },
        {
          key: "id",
          label: <Trans>Schedule ID</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { schedules } = config;
            const schedule = schedules && schedules[0];
            return getDisplayValue(schedule && schedule.id);
          }
        },
        {
          key: "cron",
          label: <Trans>CRON</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { schedules } = config;
            const schedule = schedules && schedules[0];
            return getDisplayValue(schedule && schedule.cron);
          }
        },
        {
          key: "timezone",
          label: <Trans>Timezone</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { schedules } = config;
            const schedule = schedules && schedules[0];
            return getDisplayValue(schedule && schedule.timezone);
          }
        },
        {
          key: "startingDeadlineSeconds",
          label: <Trans>Starting Deadline</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { schedules } = config;
            const schedule = schedules && schedules[0];
            return getDisplayValue(
              schedule && schedule.startingDeadlineSeconds
            );
          }
        },
        {
          key: "concurrencyPolicy",
          label: <Trans>Concurrency Policy</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { schedules } = config;
            const schedule = schedules && schedules[0];
            return getDisplayValue(schedule && schedule.concurrencyPolicy);
          }
        },
        {
          key: "enabled",
          label: <Trans>Enabled</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { schedules } = config;
            const schedule = schedules && schedules[0];
            return `${
              schedule ? (schedule.enabled != null ? schedule.enabled : "") : ""
            }`;
          }
        }
      ]
    };
  }
}

export default ScheduleConfigSection;
