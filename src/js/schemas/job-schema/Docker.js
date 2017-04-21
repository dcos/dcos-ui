/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

const General = {
  title: "Docker Container",
  description: "Configure your job settings",
  type: "object",
  properties: {
    image: {
      title: "Image",
      description: "Name of your Docker image",
      type: "string",
      getter(job) {
        return job.getDocker().image;
      }
    }
  },
  required: []
};

module.exports = General;
