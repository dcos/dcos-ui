/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import ContainerSettings from './service-schema/ContainerSettings';
import EnvironmentVariables from './service-schema/EnvironmentVariables';
import General from './service-schema/General';
import Labels from './service-schema/Labels';
import Optional from './service-schema/Optional';

let ServiceSchema = {
  type: 'object',
  properties: {
    general: General,
    containerSettings: ContainerSettings,
    optional: Optional,
    environmentVariables: EnvironmentVariables,
    labels: Labels
  },
  required: [
    'general'
  ]
};

module.exports = ServiceSchema;
