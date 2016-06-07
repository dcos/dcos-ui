/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import General from './service-schema/General';
import Optional from './service-schema/Optional';
import ContainerSettings from './service-schema/ContainerSettings';

let ServiceSchema = {
  type: 'object',
  properties: {
    general: General,
    containerSettings: ContainerSettings,
    optional: Optional,
    'environmentVariables': {
      description: 'Variables exposed to your environment homie.',
      type: 'object',
      title: 'Environment Variables',
      properties: {
        ports: {
          description: 'ports for ships to dock',
          type: 'array',
          duplicable: true,
          getter: function (service) {
            return service.getCommand();
          },
          itemShape: {
            properties: {
              key: {
                type: 'string',
                getter: function (service) {
                  return service.getCommand();
                }
              },
              value: {
                type: 'string',
                getter: function (service) {
                  return service.getCommand();
                }
              }
            }
          }
        }
      }
    }
  },
  required: [
    'general'
  ]
};

module.exports = ServiceSchema;
