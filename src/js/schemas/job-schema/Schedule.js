/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import JobValidatorUtil from '../../utils/JobValidatorUtil';
import MetadataStore from '../../stores/MetadataStore';
import ValidatorUtil from '../../utils/ValidatorUtil';

const Schedule = {
  title: 'Schedule',
  description: 'Set time and date for the job to run',
  type: 'object',
  properties: {
    runOnSchedule: {
      label: 'Run on a schedule',
      showLabel: true,
      title: 'Run on a schedule',
      type: 'boolean',
      getter(job) {
        let [schedule] = job.getSchedules();

        return schedule != null;
      }
    },
    cron: {
      title: 'CRON Schedule',
      description: (
        <span>
          Use cron format to set your schedule, e.g. <i>0 0 20 * * *</i><br/><a href={MetadataStore.buildDocsURI('/usage/jobs/getting-started')} target="_blank">View documentation</a>.
        </span>
      ),
      type: 'string',
      getter(job) {
        let [schedule = {}] = job.getSchedules();

        return schedule.cron;
      },
      externalValidator({schedule}, definition) {
        if (!schedule.runOnSchedule) {
          return true;
        }

        if (!JobValidatorUtil.isValidCronSchedule(schedule.cron)) {
          definition.showError = 'CRON Schedule must not be empty and it must '+
          'follow the correct CRON format specifications';
          return false;
        }

        return true;
      }
    },
    timezone: {
      title: 'Time Zone',
      description: 'Enter time zone in TZ format, e.g. America/New_York',
      type: 'string',
      getter(job) {
        let [schedule = {}] = job.getSchedules();

        return schedule.timezone;
      }
    },
    startingDeadlineSeconds: {
      title: 'Starting Deadline',
      description: 'Time in seconds to start the job if it misses ' +
      'scheduled time for any reason. Missed jobs executions will be ' +
      'counted as failed ones.',
      type: 'number',
      getter(job) {
        let [schedule = {}] = job.getSchedules();

        return schedule.startingDeadlineSeconds;
      },
      externalValidator({schedule}, definition) {
        if (!schedule.runOnSchedule) {
          return true;
        }

        if (ValidatorUtil.isEmpty(schedule.startingDeadlineSeconds)) {
          return true;
        }

        if (!ValidatorUtil.isNumber(schedule.startingDeadlineSeconds)) {
          definition.showError = 'Expecting a number here';
          return false;
        }

        if (schedule.startingDeadlineSeconds < 0) {
          definition.showError = 'Starting Deadline must be a positive integer';
          return false;
        }
        return true;
      }
    }
  },
  required: ['cron']

};

module.exports = Schedule;
