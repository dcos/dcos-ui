import ServiceSpec from './ServiceSpec';

module.exports = class PodSpec extends ServiceSpec {

  getContainers() {
    return this.get('containers') || [];
  }

  getContainerSpec(name) {
    return this.getContainers().find(function (container) {
      return container.name === name;
    });
  }

  getContainerCount() {
    return this.getContainers().length;
  }

  getLabels() {
    return this.get('labels');
  }

  getResourcesSummary() {
    return this.getContainers().reduce(function (resources, container) {

      Object.keys(container.resources).forEach(function (key) {
        resources[key] += container.resources[key];
      });

      return resources;
    }, {
      cpus: 0,
      mem: 0,
      gpus: 0,
      disk: 0
    });
  }

  getScalingInstances() {
    let scaling = this.get('scaling') || {};
    if (!scaling.fixed) {
      return 1;
    }
    return scaling.fixed.instances || 1;
  }

  getVersion() {
    return this.get('version');
  }
};
