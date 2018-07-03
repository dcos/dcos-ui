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
    },
    privileged: {
      type: "boolean",
      description: "Run this docker image in privileged mode",
      getter(job) {
        return job.getDocker().privileged;
      }
    }
  },
  required: []
};

module.exports = General;
