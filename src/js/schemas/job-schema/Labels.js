const Labels = {
  type: 'object',
  title: 'Labels',
  properties: {
    items: {
      type: 'array',
      duplicable: true,
      addLabel: 'Add Label',
      getter: function (job) {
        let labels = job.getLabels() || {};

        return Object.keys(labels).map(function (key) {
          return {
            key,
            value: labels[key]
          };
        });
      },
      itemShape: {
        properties: {
          key: {
            title: 'Label Name',
            type: 'string'
          },
          value: {
            title: 'Label Value',
            type: 'string'
          }
        }
      }
    }
  }
};

module.exports = Labels;
