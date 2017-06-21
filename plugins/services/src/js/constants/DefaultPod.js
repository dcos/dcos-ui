const DEFAULT_POD_RESOURCES = { cpus: 0.1, mem: 128 };
const DEFAULT_POD_SCALING = { kind: "fixed", instances: 1 };
const DEFAULT_POD_CONTAINER = {
  name: "container-1",
  resources: DEFAULT_POD_RESOURCES
};
const DEFAULT_POD_SPEC = {
  containers: [DEFAULT_POD_CONTAINER],
  scaling: DEFAULT_POD_SCALING
};

module.exports = {
  DEFAULT_POD_CONTAINER,
  DEFAULT_POD_RESOURCES,
  DEFAULT_POD_SCALING,
  DEFAULT_POD_SPEC
};
