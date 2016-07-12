import {Hooks} from 'PluginSDK';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

let EnvironmentVariables = {
  description: Hooks.applyFilter(
    'environmentVariablesDescription',
    (
      <span>
        Set variables for each task your service launches. <a href="https://mesosphere.github.io/marathon/docs/task-environment-vars.html" target="_blank">Learn more about variables</a>.
      </span>
    )
  ),
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
