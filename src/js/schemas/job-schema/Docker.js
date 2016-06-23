/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

const General = {
  title: 'Docker Container',
  description: 'Configure your job settings',
  type: 'object',
  properties: {
    image: {
      title: 'image',
      description: 'Name of your Docker image',
      type: 'string',
      getter: function (job) {
        return job.getDocker().image;
      }
    }
  },
  required: []

};

module.exports = General;
