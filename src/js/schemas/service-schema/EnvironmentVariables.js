import {Hooks} from 'PluginSDK';

let EnvironmentVariables = {
  description: 'Set variables for each task your service launches. You can also use variables to expose Secrets. <a href="/secrets">Manage secrets here</a>. <a href="https://mesosphere.github.io/marathon/docs/task-environment-vars.html">Read more about variables</a>.',
  type: 'object',
  title: 'Environment Variables',
  properties: {
    environmentVariables: {
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
