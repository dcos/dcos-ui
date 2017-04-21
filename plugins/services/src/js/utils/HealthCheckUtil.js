import HealthCheckProtocols from "../constants/HealthCheckProtocols";

module.exports = {
  isKnownProtocol(protocol) {
    return ["", ...Object.values(HealthCheckProtocols)].includes(protocol);
  }
};
