/* eslint-disable no-unused-vars */
import React from 'react';
import ValidatorUtil from '../../utils/ValidatorUtil';
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
      getter(job) {
        let [schedule = {}] = job.getSchedules();

        return schedule.cron;
      },
      validator: function (value) {
        let test;
        let parts = value.split(/ +/);
        if (parts.length !== 5) {
          return 'Expecting 5 components: minute hour date month weekday';
        }

        // Validate minute
        test = ValidatorUtil.testCronComponent( parts[0], 0, 59 );
        if (test !== null) {
          return 'Minute (1rst component) '+test;
        }

        // Validate hour
        test = ValidatorUtil.testCronComponent( parts[1], 0, 23 );
        if (test !== null) {
          return 'Hour (2nd component) '+test;
        }

        // Validate date
        test = ValidatorUtil.testCronComponent( parts[2], 1, 31 );
        if (test !== null) {
          return 'Date (3rd component) '+test;
        }

        // Validate month
        test = ValidatorUtil.testCronComponent( parts[3], 1, 12,
          ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        );
        if (test !== null) {
          return 'Month (4th component) '+test;
        }

        // Validate weekday
        test = ValidatorUtil.testCronComponent( parts[4], 0, 6,
          ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        );
        if (test !== null) {
          return 'Week day (5th component) '+test;
        }

        // All tests passed successfully
        return null;
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
