import { Hooks } from "PluginSDK";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

const EnvironmentVariables = {
  description: (
    <span>
      {"Set variables for each task your service launches. "}
      <a
        href="https://mesosphere.github.io/marathon/docs/task-environment-vars.html"
        target="_blank"
      >
        Learn more about variables
      </a>.
    </span>
  ),
  type: "object",
  title: "Environment Variables",
  properties: {
    environmentVariables: {
      type: "array",
      duplicable: true,
      addLabel: "Add Environment Variable",
      getter(service) {
        const variableMap = service.getEnvironmentVariables();
        if (variableMap == null) {
          return [];
        }

        return Object.keys(variableMap).reduce(function(memo, key) {
          if (
            (key == null || key === "undefined") &&
            (variableMap[key] === "undefined" || variableMap[key] == null)
          ) {
            return;
          }

          memo.push(
            Hooks.applyFilter(
              "variablesGetter",
              {
                key,
                value: variableMap[key]
              },
              service
            )
          );

          return memo;
        }, []);
      },
      itemShape: {
        properties: {
          key: {
            inputClass: "form-control text-uppercase",
            title: "Key",
            type: "string"
          },
          value: {
            title: "Value",
            type: "string"
          }
        }
      }
    }
  }
};

module.exports = EnvironmentVariables;
