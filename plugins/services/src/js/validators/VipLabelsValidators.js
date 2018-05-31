import { isEmpty } from "#SRC/js/utils/ValidatorUtil";
import NetworkValidatorUtil from "#SRC/js/utils/NetworkValidatorUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { VIP_LABEL_VALUE_REGEX } from "#SRC/js/constants/Networking";
import ServiceConfigUtil from "../utils/ServiceConfigUtil";

function checkServiceEndpoints(ports, pathPrefix) {
  return ports.reduce(function(portsMemo, port, index) {
    const labels = port.labels || {};
    const vipLabels = Object.keys(labels).filter(
      ServiceConfigUtil.matchVIPLabel
    );

    const errors = vipLabels.reduce(function(errorsMemo, label) {
      const vipLabelMatch = VIP_LABEL_VALUE_REGEX.exec(labels[label]);

      if (!vipLabelMatch) {
        return errorsMemo.concat({
          path: pathPrefix.concat([index, "labels", label]),
          message:
            "VIP label must be in the following format: <ip-addres|name>:<port>"
        });
      }

      const vipPort = vipLabelMatch[2];

      if (!NetworkValidatorUtil.isValidPort(vipPort)) {
        return errorsMemo.concat({
          path: pathPrefix.concat([index, "labels", label]),
          message: "Port should be an integer less than or equal to 65535"
        });
      }

      return errorsMemo;
    }, []);

    return portsMemo.concat(errors);
  }, []);
}

const VipLabelsValidators = {
  mustContainPort(app) {
    // Single container app with HOST network
    let ports = findNestedPropertyInObject(app, "portDefinitions");
    let pathPrefix = ["portDefinitions"];

    // Single container app with BRIDGE or USER network
    if (isEmpty(ports)) {
      ports = findNestedPropertyInObject(app, "container.portMappings");
      pathPrefix = ["container", "portMappings"];
    }

    if (!isEmpty(ports)) {
      return checkServiceEndpoints(ports, pathPrefix);
    }

    // Multi container app
    const containers = app.containers || [];

    return containers.reduce(function(
      memo,
      { endpoints = [] },
      containerIndex
    ) {
      pathPrefix = ["containers", containerIndex, "endpoints"];

      return memo.concat(checkServiceEndpoints(endpoints, pathPrefix));
    },
    []);
  }
};

module.exports = VipLabelsValidators;
