import HealthCheckProtocols from "../constants/HealthCheckProtocols";
import { PROTOCOLS } from "../constants/PortDefinitionConstants";
import { getHostPortPlaceholder, isHostNetwork } from "./NetworkUtil";
import ServiceValidatorUtil from "./ServiceValidatorUtil";

const HealthCheckUtil = {
  isKnownProtocol(protocol) {
    return [
      "",
      ...[
        HealthCheckProtocols.MESOS_HTTP,
        HealthCheckProtocols.MESOS_HTTPS,
        HealthCheckProtocols.COMMAND
      ]
    ].includes(protocol);
  },
  getMetadataText(protocol, portText) {
    const protocolText = PROTOCOLS.filter(
      protocolKey => protocol[protocolKey]
    ).join(",");
    const delimiter = portText && protocolText ? "/" : "";

    return protocolText || portText
      ? `(${[protocolText, portText].join(delimiter)})`
      : "";
  },
  getEndpointText(index, endpoint, data) {
    const { name, hostPort, protocol } = endpoint;
    const isPod = ServiceValidatorUtil.isPodSpecDefinition(data);
    const isAutoAssignedPort =
      isHostNetwork(data) && !isPod
        ? data.portsAutoAssign
        : endpoint.automaticPort;
    const identifier = isPod ? name : index;
    const placeholderText = isAutoAssignedPort
      ? getHostPortPlaceholder(identifier, isPod)
      : "";
    const portText = hostPort || placeholderText;

    return `${name || index} ${this.getMetadataText(protocol, portText)}`;
  }
};

export default HealthCheckUtil;
