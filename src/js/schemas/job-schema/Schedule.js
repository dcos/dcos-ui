/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { i18nMark } from "@lingui/react";

import JobValidatorUtil from "../../utils/JobValidatorUtil";
import MetadataStore from "../../stores/MetadataStore";
import ValidatorUtil from "../../utils/ValidatorUtil";

const Schedule = {
  title: i18nMark("Schedule"),
  description: i18nMark("Set time and date for the job to run"),
  type: "object",
  properties: {
    runOnSchedule: {
      label: "Run on a schedule",
      showLabel: true,
      title: i18nMark("Run on a schedule"),
      type: "boolean",
      getter(job) {
        const [schedule] = job.getSchedules();

        return schedule != null;
      }
    },
    cron: {
      title: i18nMark("CRON Schedule"),
      helpBlock: (
        <span>
          {i18nMark("Use cron format to set your schedule, e.g.")}{" "}
          <i>0 0 20 * *</i>
          {". "}
          <a
            href={MetadataStore.buildDocsURI("/deploying-jobs/")}
            target="_blank"
          >
            {i18nMark("View Documentation")}
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
          definition.showError = i18nMark(
            "CRON Schedule must not be empty and it must follow the correct CRON format specifications"
          );

          return false;
        }

        return true;
      }
    },
    timezone: {
      title: i18nMark("Time Zone"),
      description: (
        <span>
          {i18nMark("Enter time zone in ")}
          <a
            href="http://www.timezoneconverter.com/cgi-bin/zonehelp"
            target="_blank"
          >
            {i18nMark("TZ format")}
          </a>
          {i18nMark(", e.g. America/New_York.")};
        </span>
      ),
      type: "string",
      getter(job) {
        const [schedule = {}] = job.getSchedules();

        return schedule.timezone;
      }
    },
    startingDeadlineSeconds: {
      title: i18nMark("Starting Deadline"),
      description: i18nMark(
        "Time in seconds to start the job if it misses scheduled time for any reason. Missed jobs executions will be counted as failed ones."
      ),
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
          definition.showError = i18nMark("Expecting a positive number here");

          return true;
        }

        return true;
      }
    },
    enabled: {
      label: i18nMark("Enabled"),
      showLabel: true,
      title: i18nMark("Enabled"),
      type: "boolean",
      getter(job) {
        const [schedule = {}] = job.getSchedules();

        return schedule.enabled !== undefined ? schedule.enabled : false;
      }
    }
  },
  required: ["cron"]
};

module.exports = Schedule;
