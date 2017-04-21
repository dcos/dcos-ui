/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import JobValidatorUtil from "../../utils/JobValidatorUtil";
import MetadataStore from "../../stores/MetadataStore";
import ValidatorUtil from "../../utils/ValidatorUtil";

const Schedule = {
  title: "Schedule",
  description: "Set time and date for the job to run",
  type: "object",
  properties: {
    runOnSchedule: {
      label: "Run on a schedule",
      showLabel: true,
      title: "Run on a schedule",
      type: "boolean",
      getter(job) {
        const [schedule] = job.getSchedules();

        return schedule != null;
      }
    },
    cron: {
      title: "CRON Schedule",
      helpBlock: (
        <span>
          Use cron format to set your schedule, e.g. <i>0 0 20 * *</i>{". "}
          <a
            href={MetadataStore.buildDocsURI("/usage/jobs/getting-started")}
            target="_blank"
          >
            View documentation
          </a>.
        </span>
      ),
      type: "string",
      getter(job) {
        const [schedule = {}] = job.getSchedules();

        return schedule.cron;
      },
      externalValidator({ schedule }, definition) {
        if (!schedule.runOnSchedule) {
          return true;
        }

        if (!JobValidatorUtil.isValidCronSchedule(schedule.cron)) {
          definition.showError =
            "CRON Schedule must not be empty and it must " +
            "follow the correct CRON format specifications";

          return false;
        }

        return true;
      }
    },
    timezone: {
      title: "Time Zone",
      description: (
        <span>
          {"Enter time zone in "}
          <a
            href="http://www.timezoneconverter.com/cgi-bin/zonehelp"
            target="_blank"
          >
            TZ format
          </a>, e.g. America/New_York.
        </span>
      ),
      type: "string",
      getter(job) {
        const [schedule = {}] = job.getSchedules();

        return schedule.timezone;
      }
    },
    startingDeadlineSeconds: {
      title: "Starting Deadline",
      description: "Time in seconds to start the job if it misses " +
        "scheduled time for any reason. Missed jobs executions will be " +
        "counted as failed ones.",
      type: "number",
      getter(job) {
        const [schedule = {}] = job.getSchedules();

        return schedule.startingDeadlineSeconds;
      },
      externalValidator({ schedule }, definition) {
        if (!schedule.runOnSchedule) {
          return true;
        }

        if (!ValidatorUtil.isDefined(schedule.startingDeadlineSeconds)) {
          return true;
        }

        if (!ValidatorUtil.isNumberInRange(schedule.startingDeadlineSeconds)) {
          definition.showError = "Expecting a positive number here";

          return true;
        }

        return true;
      }
    }
  },
  required: ["cron"]
};

module.exports = Schedule;
