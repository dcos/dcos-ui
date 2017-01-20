import HostUtil from '../utils/HostUtil';
import Networking from '../../../../../src/js/constants/Networking';

const ServiceConfigUtil = {

  matchVIPLabel(str) {
    return Networking.VIP_LABEL_REGEX.test(str);
  },

  findVIPLabel(labels = {}) {
    return Object.keys(labels).find(ServiceConfigUtil.matchVIPLabel);
  },

  hasVIPLabel(labels = {}) {
    return !!ServiceConfigUtil.findVIPLabel(labels);
  },

  buildHostName(id, port) {
    const hostname = HostUtil.stringToHostname(id);

    return `${hostname}${Networking.L4LB_ADDRESS}:${port}`;
  }

};

module.exports = ServiceConfigUtil;
