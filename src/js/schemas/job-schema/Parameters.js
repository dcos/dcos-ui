const Parameters = {
  type: "object",
  title: "Parameters",
  description: "Add runtime parameters to a docker job run.",
  properties: {
    items: {
      type: "array",
      duplicable: true,
      addLabel: "Add Parameter",
      getter(job) {
        const parameters = job.getParameters() || {};

        return Object.keys(parameters).map(function(key) {
          return {
            key,
            value: parameters[key]
          };
        });
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
