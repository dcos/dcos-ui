import HostUtil from "../utils/HostUtil";
import Networking from "../../../../../src/js/constants/Networking";

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
  },

  buildHostNameFromVipLabel(label, port) {
    const [ipOrName, labelPort = ""] = label.split(":");

    // Sometimes we don't know the port yet
    port = port || "<assigned port>";

    // 0 means randomly assigned port
    port = labelPort === "0" ? port : labelPort;

    // it seems to be an IP address
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(ipOrName)) {
      return `${ipOrName}:${port}`;
    }

    const hostname = HostUtil.stringToHostname(ipOrName);

    return `${hostname}${Networking.L4LB_ADDRESS}:${port}`;
  }
};

module.exports = ServiceConfigUtil;
