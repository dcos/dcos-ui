/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

let General = {
  title: 'General',
  description: 'Configure your container',
  type: 'object',
  properties: {
    id: {
      title: 'ID',
      description: 'The id for the service',
      type: 'string',
      getter: function (service) {
        return service.getId();
      }
    },
    resources: {
      type: 'group',
      properties: {
        cpus: {
          title: 'CPUs',
          description: 'The amount of CPUs which are used for the service',
          type: 'number',
          default: 1,
          getter: function (service) {
            return `${service.getCpus() || ''}`;
          }
        },
        mem: {
          title: 'Mem (MiB)',
          type: 'number',
          default: 128,
          getter: function (service) {
            return `${service.getMem() || ''}`;
          }
        },
        disk: {
          title: 'Disk (MiB)',
          type: 'number',
          default: 0,
          getter: function (service) {
            return `${service.getDisk() || ''}`;
          }
        },
        instances: {
          title: 'Instances',
          type: 'number',
          default: 1,
          getter: function (service) {
            return `${service.getInstancesCount() || ''}`;
          }
        }
      }
    },
    cmd: {
      title: 'Command',
      description: 'The command which is executed by the service',
      type: 'string',
      multiLine: true,
      getter: function (service) {
        return service.getCommand();
      }
    }
  },
  required: [
    'id'
  ]
};

module.exports = General;
