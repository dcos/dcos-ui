const NETWORK_MODES = [
  ["host", "HOST"],
  ["container", "CONTAINER"],
  ["container/bridge", "BRIDGE"]
];

const jsonToInternal = NETWORK_MODES.reduce(function(memo, tuple) {
  const [jsonType, internalType] = tuple;
  memo[jsonType] = internalType;

  return memo;
}, {});

const internalToJson = NETWORK_MODES.reduce(function(memo, tuple) {
  const [jsonType, internalType] = tuple;
  memo[internalType] = jsonType;

  return memo;
}, {});

const Networking = {
  jsonToInternal,
  internalToJson,
  type: {
    BRIDGE: "BRIDGE",
    CONTAINER: "CONTAINER",
    HOST: "HOST",
    USER: "USER"
  },
  L4LB_ADDRESS: ".marathon.l4lb.thisdcos.directory",
  VIP_LABEL_REGEX: /^VIP_[0-9]+$/,
  VIP_LABEL_VALUE_REGEX: /([\w\d_\-./]+):(\d+)/
};

export default Networking;
