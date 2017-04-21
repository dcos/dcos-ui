const Labels = {
  type: "object",
  title: "Labels",
  description: "Attach metadata to services to expose additional information to other services.",
  properties: {
    labels: {
      type: "array",
      duplicable: true,
      addLabel: "Add Label",
      getter(service) {
        const labels = service.getLabels() || {};

        return Object.keys(labels).map(function(key) {
          return {
            key,
            value: labels[key]
          };
        });
      },
      itemShape: {
        properties: {
          key: {
            title: "Label Name",
            type: "string"
          },
          value: {
            title: "Label Value",
            type: "string"
          }
        }
      }
    }
  }
};

module.exports = Labels;
