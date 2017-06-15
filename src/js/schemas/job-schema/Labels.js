const Labels = {
  type: "object",
  title: "Labels",
  description: "Attach metadata to jobs to expose additional information to other jobs.",
  properties: {
    items: {
      type: "array",
      duplicable: true,
      addLabel: "Add Label",
      getter(job) {
        const labels = job.getLabels() || {};

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
