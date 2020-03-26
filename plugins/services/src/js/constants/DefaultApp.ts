import ContainerConstants from "./ContainerConstants";

const { MESOS } = ContainerConstants.type;

export const DEFAULT_APP_SPEC = {
  instances: 1,
  portDefinitions: [],
  container: { type: MESOS },
  cpus: 0.1,
  mem: 128,
};
