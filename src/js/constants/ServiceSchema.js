/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

let SERVICE_SCHEMA = {
  type: 'object',
  properties: {
    General: {
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
        cpus: {
          title: 'CPUs',
          description: 'The amount of CPUs which are used for the service',
          type:'number',
          getter: function (service) {
            return (service.getCpus() || '');
          }
        },
        mem: {
          title: 'Mem (MiB)',
          type: 'number',
          getter: function (service) {
            return (service.getMem() || '');
          }
        },
        disk: {
          title: 'Disk (MiB)',
          type: 'number',
          getter: function (service) {
            return (service.getDisk() || '');
          }
        },
        instances: {
          title: 'Instances',
          type: 'number',
          getter: function (service) {
            return (service.getInstancesCount() || 0) + '';
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
    },
    'Container Settings': {
      description: 'Configure your Docker Container',
      type: 'object',
      properties: {
        image: {
          description: 'name of your docker image',
          type: 'string',
          getter: function (service) {
            let container = service.getContainerSettings();
            if (container && container.docker && container.docker.image) {
              return container.docker.image;
            }
            return null;
          }
        },
        network: {
          title: 'Network',
          fieldType: 'select',
          options: [
            'Host',
            'Bridged'
          ],
          getter: function (service) {
            let container = service.getContainerSettings();
            if (container && container.docker && container.docker.network) {
              return container.docker.network.toLowerCase();
            }
            return null;
          }
        }
      },
      required: []
    }
  },
  required: [
    'General'
  ]
};

module.exports = SERVICE_SCHEMA;
