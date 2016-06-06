/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import General from './service-schema/General';
import Optional from './service-schema/Optional';

let ServiceSchema = {
  type: 'object',
  properties: {
    General: General,
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
    'Optional': Optional
  },
  required: [
    'General'
  ]
};

module.exports = ServiceSchema;
