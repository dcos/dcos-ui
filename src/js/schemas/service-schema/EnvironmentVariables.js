import {Hooks} from 'PluginSDK';

let EnvironmentVariables = {
  description: 'Set environment variables for each task your service launches in addition to those set by Mesos.',
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
          return [];
        }
        return Object.keys(variableMap).map(function (key) {
          return Hooks.applyFilter('variablesGetter', {
            key,
            value: variableMap[key]
          }, service);
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
