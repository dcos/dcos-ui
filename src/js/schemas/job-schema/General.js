/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import MesosConstants from '../../constants/MesosConstants';

const General = {
  title: 'General',
  description: 'Configure your job settings',
  type: 'object',
  properties: {
    id: {
      focused: true,
      title: 'ID',
      description: 'The job ID',
      type: 'string',
      getter(job) {
        return job.getId();
      }
    },
    description: {
      title: 'Description',
      description: 'Job description',
      type: 'string',
      getter(job) {
        return job.getDescription();
      }
    },
    resources: {
      type: 'group',
      properties: {
        cpus: {
          title: 'CPUs',
          default: MesosConstants.MIN_CPUS,
          description: 'The amount of CPUs the job requires',
          type:'number',
          getter(job) {
            return `${job.getCpus() || ''}`;
          },
          minimum: 0,
          exclusiveMinimum: true
        },
        mem: {
          title: 'Mem (MiB)',
          default: MesosConstants.MIN_MEM,
          type: 'number',
          getter(job) {
            return `${job.getMem() || ''}`;
          },
          minimum: 32
        },
        disk: {
          title: 'Disk (MiB)',
          default: 0,
          type: 'number',
          getter(job) {
            return `${job.getDisk() || ''}`;
          },
          minimum: 0,
          exclusiveMinimum: true
        }
      }
    },
    cmd: {
      title: 'Command',
      description: 'The command executed by the service',
      type: 'string',
      multiLine: true,
      getter(job) {
        return job.getCommand();
      }
    }
  },
  required: [
    'id'
  ]
};

module.exports = General;
