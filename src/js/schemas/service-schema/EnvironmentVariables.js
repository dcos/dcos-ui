let EnvironmentVariables = {
  description: 'Set environment variables for each task your service launches in addition to those set be Mesos.',
  type: 'object',
  title: 'Environment Variables',
  properties: {
    variables: {
      type: 'array',
      duplicable: true,
      addLabel: 'Add Environment Variable',
      getter: function (service) {
        let variableMap = service.getEnvironmentVariables();
        if (variableMap == null) {
          return [{
            key: null,
            value: null,
            usingSecret: null
          }];
        }
        return Object.keys(variableMap).map(function (key) {
          let value = variableMap[key];
          let usingSecret = null;

          if (typeof value === 'object' && value != null) {
            usingSecret = true;
            value = service.get('secrets')[value.secret].source;
          }

          return {
            key,
            value,
            usingSecret
          };
        });
      },
      itemShape: {
        properties: {
          key: {
            title: 'Key',
            type: 'string'
          },
          value: {
            title: 'Value',
            type: 'string'
          }
        }
      }
    }
  }
};

module.exports = EnvironmentVariables;
