interface NetworkType {
  BRIDGE: string;
  CONTAINER: string;
  HOST: string;
  USER: string;
}

interface Networking {
  jsonToInternal: object;
  internalToJson: object;
  type: NetworkType;
  L4LB_ADDRESS: string;
  VIP_LABEL_REGEX: RegExp;
  VIP_LABEL_VALUE_REGEX: RegExp;
}

declare var Networking: Networking;

export default Networking;
