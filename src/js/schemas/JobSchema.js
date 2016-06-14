/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import Docker from './job-schema/Docker';
import General from './job-schema/General';
import Schedule from './job-schema/Schedule';

let JobSchema = {
  type: 'object',
  properties: {
    general: General,
    schedule: Schedule,
    docker: Docker,
  },
  required: [
    'general'
  ]
};

module.exports = JobSchema;
