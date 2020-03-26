import Networking from "#SRC/js/constants/Networking";

import HostUtil from "../utils/HostUtil";

const ServiceConfigUtil = {
  matchVIPLabel: (str) => Networking.VIP_LABEL_REGEX.test(str),
  findVIPLabel: (labels = {}) =>
    Object.keys(labels).find(ServiceConfigUtil.matchVIPLabel),
  hasVIPLabel: (labels = {}) => !!ServiceConfigUtil.findVIPLabel(labels),
  buildHostName: (id, port) =>
    `${HostUtil.stringToHostname(id)}${Networking.L4LB_ADDRESS}:${port}`,
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
  },
};

export default ServiceConfigUtil;
