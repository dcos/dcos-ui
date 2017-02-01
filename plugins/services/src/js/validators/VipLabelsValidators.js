import {isEmpty} from '../../../../../src/js/utils/ValidatorUtil';
import ServiceConfigUtil from '../utils/ServiceConfigUtil';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import {VIP_LABEL_VALUE_REGEX} from '../../../../../src/js/constants/Networking';

function checkServiceEndpoints(ports, pathPrefix) {
  return ports.reduce(function (memo, port, index) {
    const labels = port.labels || {};
    const vipLabels = Object.keys(labels)
      .filter(ServiceConfigUtil.matchVIPLabel);

    vipLabels.forEach(function (label) {
      if (!VIP_LABEL_VALUE_REGEX.test(labels[label])) {
        memo.push({
          path: pathPrefix.concat([index, 'labels', label]),
          message: 'VIP label should be in the following format: <ip-address|name>:<port>'
        });
      }
    });

    return memo;
  }, []);
}

const VipLabelsValidators = {
  mustContainPort(app) {

    // Single container app with HOST network
    let ports = findNestedPropertyInObject(app, 'portDefinitions');
    let pathPrefix = ['portDefinitions'];

    // Single container app with BRIDGE or USER network
    if (isEmpty(ports)) {
      ports = findNestedPropertyInObject(app, 'container.docker.portMappings');
      pathPrefix = ['container', 'docker', 'portMappings'];
    }

    if (!isEmpty(ports)) {
      return checkServiceEndpoints(ports, pathPrefix);
    }

    // Multi container app
    const containers = app.containers || [];

    return containers.reduce(function (memo, {endpoints = []}, containerIndex) {
      pathPrefix = ['containers', containerIndex, 'endpoints'];

      return memo.concat(checkServiceEndpoints(endpoints, pathPrefix));
    }, []);
  }
};

module.exports = VipLabelsValidators;
