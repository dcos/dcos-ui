import ContainerConstants from "./ContainerConstants";

const { MESOS } = ContainerConstants.type;

const DEFAULT_APP_RESOURCES = { cpus: 0.1, mem: 128 };
const DEFAULT_APP_CONTAINER = { container: { type: MESOS } };
const DEFAULT_APP_SPEC = Object.assign(
  { instances: 1, portDefinitions: [] },
  DEFAULT_APP_CONTAINER,
  DEFAULT_APP_RESOURCES
);

export default {
  DEFAULT_APP_RESOURCES,
  DEFAULT_APP_SPEC
};
