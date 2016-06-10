var Labels = {
  type: 'object',
  title: 'Labels',
  properties: {
    labels: {
      type: 'array',
      duplicable: true,
      addLabel: 'Add Label',
      getter: function (service) {
        let labels = service.getLabels() || {};

        return Object.keys(labels).reduce(function (memo, key) {
          memo.push({
            key,
            value: labels[key]
          });

          return memo;
        }, []);
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
