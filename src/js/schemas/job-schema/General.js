/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

const General = {
  title: 'General',
  description: 'Configure your job settings',
  type: 'object',
  properties: {
    id: {
      title: 'ID',
      description: 'The job ID',
      type: 'string',
      getter: function (job) {
        return job.getId();
      }
    },
    description: {
      title: 'Description',
      description: 'Job description',
      type: 'string',
      getter: function (job) {
        return job.getDescription();
      }
    },
    cpus: {
      title: 'CPUs',
      description: 'The amount of CPUs the job requires',
      type:'number',
      getter: function (job) {
        return `${job.getCpus() || ''}`;
      }
    },
    mem: {
      title: 'Mem (MiB)',
      type: 'number',
      getter: function (job) {
        return `${job.getMem() || ''}`;
      }
    },
    disk: {
      title: 'Disk (MiB)',
      type: 'number',
      getter: function (job) {
        return `${job.getDisk() || ''}`;
      }
    },
    cmd: {
      title: 'Command',
      description: 'The command executed by the service',
      type: 'string',
      multiLine: true,
      getter: function (job) {
        return job.getCommand();
      }
    }
  },
  required: [
    'id','description'
  ]
};

module.exports = General;
