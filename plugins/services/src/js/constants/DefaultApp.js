import ContainerConstants from "./ContainerConstants";

const { DOCKER } = ContainerConstants.type;

const DEFAULT_APP_RESOURCES = { cpus: 0.1, mem: 128 };
const DEFAULT_APP_CONTAINER = { container: { type: DOCKER } };
const DEFAULT_APP_SPEC = Object.assign(
  { instances: 1, portDefinitions: [] },
  DEFAULT_APP_CONTAINER,
  DEFAULT_APP_RESOURCES
);

module.exports = {
  DEFAULT_APP_RESOURCES,
  DEFAULT_APP_SPEC
};
