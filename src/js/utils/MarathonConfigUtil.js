import HostUtil from '../utils/HostUtil';
import Networking from '../constants/Networking';

const serviceAddressKey = 'Service Address';

function buildHostName(id, port) {
  let hostname = HostUtil.stringToHostname(id);
  return `${hostname}${Networking.L4LB_ADDRESS}:${port}`;
}

function defaultCreateLink(contents) {
  return contents;
}

var MarathonConfigUtil = {

  getCommandString(container) {

    // Pre-pods approach
    if (container.cmd) {
      return container.cmd;
    }

    // Pods approach
    // https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/podContainer.raml#L61
    if (container.exec && container.exec.command) {
      let {command} = container.exec;
      if (command.shell) {
        return command.shell;
      }
      if (command.argv) {
        return command.argv.join(' ');
      }
    }

    return null;
  },

  getPortDefinitionGroups(id, portDefinitions, createLink = defaultCreateLink) {
    return portDefinitions.map(function (portDefinition, index) {
      let headline = `Port Definition ${index + 1}`;

      if (portDefinition.name) {
        headline += ` (${portDefinition.name})`;
      }

      let headerValueMapping = Object.assign(
        {[serviceAddressKey]: null},
        portDefinition
      );

      // Check if this port is load balanced
      let hasVIPLabel = portDefinition.labels &&
        Object.keys(portDefinition.labels).find(function (key) {
          return /^VIP_[0-9]+$/.test(key);
        });
      if (hasVIPLabel) {
        let link = buildHostName(id, portDefinition.port);
        headerValueMapping[serviceAddressKey] = createLink(link, link);
      } else {
        delete headerValueMapping[serviceAddressKey];
      }

      return {
        hash: headerValueMapping,
        headline
      };
    });
  }

};

module.exports = MarathonConfigUtil;
