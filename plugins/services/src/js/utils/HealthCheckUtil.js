import HealthCheckProtocols from "../constants/HealthCheckProtocols";

module.exports = {
  isKnownProtocol(protocol) {
    return [
      "",
      ...[
        HealthCheckProtocols.MESOS_HTTP,
        HealthCheckProtocols.MESOS_HTTPS,
        HealthCheckProtocols.COMMAND
      ]
    ].includes(protocol);
  }
};
