/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

const ContainerSettings = {
  title: 'Container Settings',
  description: 'Configure your Docker Container. You can configure your Docker volumes in the Volumes tab and your Docker ports in the Network tab.',
  type: 'object',
  properties: {
    basic: {
      type: 'group',
      properties: {
        image: {
          description: (
            <span>
              Configure your Docker container. Use <a href="https://hub.docker.com/explore/" target="_blank">DockerHub</a> to find popular repositories.
            </span>
          ),
          title: 'Container Image',
          type: 'string',
          getter: function (service) {
            let container = service.getContainerSettings();
            if (container && container.docker && container.docker.image) {
              return container.docker.image;
            }
            return null;
          }
        }
      }
    },
    flags: {
      type: 'group',
      properties: {
        privileged: {
          label: 'Extend runtime privileges',
          showLabel: false,
          type: 'boolean',
          getter: function (service) {
            let container = service.getContainerSettings();
            if (container && container.docker &&
              container.docker.privileged
            ) {
              return container.docker.privileged;
            }
            return null;
          }
        },
        forcePullImage: {
          label: 'Force pull image on launch',
          showLabel: false,
          type: 'boolean',
          getter: function (service) {
            let container = service.getContainerSettings();
            if (container && container.docker &&
              container.docker.forcePullImage
            ) {
              return container.docker.forcePullImage;
            }
            return null;
          }
        },
      }
    },
    parameters: {
      title: 'Docker Parameters',
      description: (
        <span>
          Supply options for the <a href="https://docs.docker.com/engine/reference/commandline/run/" target="_blank">docker run</a> command executed by the Mesos containerizer.
        </span>
      )
      type: 'array',
      duplicable: true,
      addLabel: 'Add Parameter',
      getter: function (service) {
        let container = service.getContainerSettings();
        if (container && container.docker &&
          container.docker.parameters
        ) {
          let parameters = container.docker.parameters;

          return Object.keys(parameters).map(function (key) {
            return {
              key,
              value: parameters[key]
            };
          });
        }
        return null;
      },
      itemShape: {
        properties: {
          key: {
            title: 'Key',
            type: 'string'
          },
          value: {
            title: 'Value',
            type: 'string'
          }
        }
      }
    }
  },
  required: []
};

module.exports = ContainerSettings;
