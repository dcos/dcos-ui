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
            return `${service.getCpus() || ''}`;
          }
        },
        mem: {
          title: 'Mem (MiB)',
          type: 'number',
          getter: function (service) {
            return `${service.getMem() || ''}`;
          }
        },
        disk: {
          title: 'Disk (MiB)',
          type: 'number',
          getter: function (service) {
            return `${service.getDisk() || ''}`;
          }
        },
        instances: {
          title: 'Instances',
          type: 'number',
          getter: function (service) {
            return `${service.getInstancesCount() || 0}`;
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
    },
    'Optional': {
      type: 'object',
      properties: {
        executor: {
          title: 'Executor',
          type: 'string',
          description: 'Executor must be the string \'//cmd\', a string ' +
          'containing only single slashes (\'/\'), or blank.',
          getter: function (service) {
            return service.getExecutor();
          }
        },
        uris: {
          title: 'URIs',
          type: 'string',
          description: 'Comma-separated list of valid URIs.',
          getter: function (service) {
            if (!service.getFetch()) {
              return null;
            }
            return service.getFetch().map(function (item) {
              return item.uri;
            }).join(', ');
          }
        },
        constraints: {
          title: 'Constraints',
          type: 'string',
          description: 'Comma-separated list of valid constraints. Valid ' +
          'constraint format is "field:operator[:value]".',
          getter: function (service) {
            return service.getConstraints() && service.getConstraints()
              .map(function (item) {
                return item.join(':');
              }).join(',')
          }
        },
        acceptedResourceRoles: {
          title: 'Accepted Resource Roles',
          type: 'string',
          description: 'Comma-separated list of resource roles. Marathon ' +
          'considers only resource offers with roles in this list for ' +
          'launching tasks of this app.',
          getter: function (service) {
            return service.getAcceptedResourceRoles() &&
              service.getAcceptedResourceRoles().join(', ');
          }
        },
        user: {
          title: 'User',
          type: 'string',
          getter: function (service) {
            return service.getUser();
          }
        }
      }
    }
  },
  required: [
    'General'
  ]
};

module.exports = SERVICE_SCHEMA;
