import { Hooks } from "PluginSDK";
import deepEqual from "deep-equal";

import Application from "../structs/Application";
import ApplicationSpec from "../structs/ApplicationSpec";
import Framework from "../structs/Framework";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceValidatorUtil from "../utils/ServiceValidatorUtil";

const getFindPropertiesRecursive = function(service, item) {
  return Object.keys(item).reduce(function(memo, subItem) {
    if (item[subItem].type === "group") {
      Object.keys(item[subItem].properties).forEach(function(key) {
        memo[key] = item[subItem].properties[key].default;

        if (
          item[subItem].properties[key].getter &&
          !!item[subItem].properties[key].getter(service)
        ) {
          memo[key] = item[subItem].properties[key].getter(service);
        }
      });

      return memo;
    }

    if (item[subItem].type === "object") {
      memo[subItem] = getFindPropertiesRecursive(
        service,
        item[subItem].properties
      );

      return memo;
    }

    memo[subItem] = item[subItem].default;

    if (item[subItem].getter) {
      memo[subItem] = item[subItem].getter(service);
    }

    return memo;
  }, {});
};

const ServiceUtil = {
  createServiceFromResponse(data) {
    if (ServiceValidatorUtil.isPodResponse(data)) {
      return new Pod(data);
    }

    if (ServiceValidatorUtil.isFrameworkResponse(data)) {
      return new Framework(data);
    }

    if (ServiceValidatorUtil.isApplicationResponse(data)) {
      return new Application(data);
    }

    throw Error("Unknown service response: " + JSON.stringify(data));
  },

  createFormModelFromSchema(schema, service = new Application()) {
    console.warn("ServieUtil.createFormModelFromSchema has been deprecated.");

    return getFindPropertiesRecursive(service, schema.properties);
  },

  isEqual(serviceA, serviceB) {
    if (serviceA.constructor !== serviceB.constructor) {
      return false;
    }

    // Only compare the service specs as everything else is status data
    return deepEqual(serviceA.getSpec(), serviceB.getSpec());
  },

  getBaseID(serviceID) {
    // The regular expression `/^(\/.+)$/` is looking for the beginning of the
    // string and matches if the string starts with a `/` and does contain more
    // characters after the slash. This is combined into a group and then
    // replaced with the first group which is the complete string and a `/` is
    // appended. This is needed because in most case a path like
    // `/group/another-group` will be given by `getId` except on root then the
    // return value of `getId` would be `/` so in most cases we want to append a
    // `/` so that the user can begin typing the `id` of their application.
    return serviceID.replace(/^(\/.+)$/, "$1/");
  },

  getDefinitionFromSpec(spec) {
    const definition = spec.toJSON();

    if (spec instanceof ApplicationSpec) {
      Hooks.applyFilter("serviceToAppDefinition", definition, spec);
    }

    return definition;
  },

  getServiceJSON(service) {
    if (!service) {
      return {};
    }

    if (service.toJSON !== undefined) {
      return service.toJSON();
    }

    return service;
  },

  /**
   * Get corresponding service ID
   *
   * @param  {string} taskID - the tasks' ID
   * @return {string} service ID
   */
  getServiceIDFromTaskID(taskID = "") {
    // Parse the task id (e.g. foo_bar.abc-123) to get the corresponding
    // service id parts (foo, bar)
    const parts = taskID.split(".")[0].split("_");

    // Join service id parts and prepend with a slash to form a valid id
    if (parts[0] !== "") {
      return `/${parts.join("/")}`;
    }

    return "";
  },

  getServiceNameFromTaskID(taskID) {
    const serviceName = taskID.split(".")[0].split("_");

    return serviceName[serviceName.length - 1];
  },

  convertServiceLabelsToArray(service) {
    if (!(service instanceof Service)) {
      return [];
    }

    const labels = service.getLabels();
    if (labels == null) {
      return [];
    }

    return Object.keys(labels).map(key => ({ key, value: labels[key] }));
  },

  isSDKService(service) {
    if (!(service instanceof Service)) {
      return false;
    }

    const labels = service.getLabels();

    return labels.DCOS_COMMONS_API_VERSION != null;
  }
};

module.exports = ServiceUtil;
