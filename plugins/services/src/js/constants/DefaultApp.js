const DEFAULT_APP_RESOURCES = {cpus: 0.1, mem: 128};
const DEFAULT_APP_SPEC = Object.assign({instances: 1}, DEFAULT_APP_RESOURCES);

module.exports = {
  DEFAULT_APP_RESOURCES,
  DEFAULT_APP_SPEC
};
