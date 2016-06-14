/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import General from './job-schema/General';

let JobSchema = {
  type: 'object',
  properties: {
    general: General
  },
  required: [
    'general'
  ]
};

module.exports = JobSchema;
