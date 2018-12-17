import { i18nMark } from "@lingui/react";

const General = {
  title: i18nMark("Docker Container"),
  description: i18nMark("Configure your job settings"),
  type: "object",
  properties: {
    image: {
      title: i18nMark("Image"),
      description: i18nMark("Name of your Docker image"),
      type: "string",
      getter(job) {
        return job.getDocker().image;
      }
    },
    privileged: {
      type: "boolean",
      description: i18nMark("Run this docker image in privileged mode"),
      getter(job) {
        return job.getDocker().privileged;
      }
    }
  },
  required: []
};

module.exports = General;
