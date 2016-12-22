import HostUtil from '../utils/HostUtil';
import Networking from '../../../../../src/js/constants/Networking';

const ServiceConfigUtil = {

  hasVIPLabel(labels = {}) {
    return Object.keys(labels).find(function (key) {
      return /^VIP_[0-9]+$/.test(key);
    });
  },

  buildHostName(id, port) {
    const hostname = HostUtil.stringToHostname(id);

    return `${hostname}${Networking.L4LB_ADDRESS}:${port}`;
  }

};

module.exports = ServiceConfigUtil;
