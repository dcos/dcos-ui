const DEFAULT_POD_CONTAINER = {
  name: "container-1",
  resources: { cpus: 0.1, mem: 128 }
};
const DEFAULT_POD_SPEC = {
  containers: [DEFAULT_POD_CONTAINER],
  scaling: { kind: "fixed", instances: 1 }
};

module.exports = {
  DEFAULT_POD_CONTAINER,
  DEFAULT_POD_SPEC
};
