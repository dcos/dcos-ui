/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

let ContainerSettings = {
  title: 'Container Settings',
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
    },
    forcePullImage: {
      title: 'Force pull image on every launch',
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
    privileged: {
      title: 'Extend runtime privileges',
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
    }
  },
  required: []
};

module.exports = ContainerSettings;
