/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import EnvironmentVariables from './service-schema/EnvironmentVariables';
import General from './service-schema/General';
import Optional from './service-schema/Optional';
import ContainerSettings from './service-schema/ContainerSettings';

let ServiceSchema = {
  type: 'object',
  properties: {
    general: General,
    containerSettings: ContainerSettings,
    optional: Optional,
    environmentVariables: EnvironmentVariables
  },
  required: [
    'general'
  ]
};

module.exports = ServiceSchema;
