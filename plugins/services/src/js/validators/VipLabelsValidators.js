import {isEmpty} from '../../../../../src/js/utils/ValidatorUtil';
import ServiceConfigUtil from '../utils/ServiceConfigUtil';
import NetworkValidatorUtil from '../../../../../src/js/utils/NetworkValidatorUtil';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import {VIP_LABEL_VALUE_REGEX} from '../../../../../src/js/constants/Networking';

function checkServiceEndpoints(ports, pathPrefix) {
  return ports.reduce(function (memo, port, index) {
    const labels = port.labels || {};
    const vipLabels = Object.keys(labels)
      .filter(ServiceConfigUtil.matchVIPLabel);

    vipLabels.forEach(function (label) {
      const [_address, vipPort] = labels[label].split(':');

      if (!VIP_LABEL_VALUE_REGEX.test(labels[label])) {
        memo.push({
          path: pathPrefix.concat([index, 'labels', label]),
          message: 'VIP label must be in the following format: <ip-addres|name>:<port>'
        });
      }
      if (!NetworkValidatorUtil.isValidPort(vipPort)) {
        memo.push({
          path: pathPrefix.concat([index, 'labels', label]),
          message: 'Port should be an integrer less than or equal to 65535'
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
