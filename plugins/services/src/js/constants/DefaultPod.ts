export const DEFAULT_POD_CONTAINER = {
  name: "container-1",
  resources: { cpus: 0.1, mem: 128 },
};
export const DEFAULT_POD_SPEC = {
  containers: [DEFAULT_POD_CONTAINER],
  scaling: { kind: "fixed", instances: 1 },
};
