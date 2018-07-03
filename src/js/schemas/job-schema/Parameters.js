const Parameters = {
  type: "object",
  title: "Docker Parameters",
  description: "Add runtime parameters to a docker job run.",
  properties: {
    items: {
      type: "array",
      duplicable: true,
      addLabel: "Add Parameter",
      getter(job) {
        return job.getParameters() || [];
      },
      itemShape: {
        properties: {
          key: {
            title: "Parameter Name",
            type: "string"
          },
          value: {
            title: "Parameter Value",
            type: "string"
          }
        }
      }
    }
  }
};

module.exports = Parameters;
