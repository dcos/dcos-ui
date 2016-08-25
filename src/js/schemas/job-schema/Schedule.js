/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import MetadataStore from '../../stores/MetadataStore';

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
      pattern: '^(\\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\\*\\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\\*|([0-9]|1[0-9]|2[0-3])|\\*\\/([0-9]|1[0-9]|2[0-3])) (\\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\\*\\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\\*|([1-9]|1[0-2])|\\*\\/([1-9]|1[0-2])) (\\*|([0-6])|\\*\\/([0-6]))$',
      getter(job) {
        let [schedule = {}] = job.getSchedules();

        return schedule.cron;
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
      minimum: 0,
      exclusiveMinimum: true
    }
  },
  required: ['cron']

};

module.exports = Schedule;
