import HealthCheckProtocols from "../constants/HealthCheckProtocols";

export default {
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
