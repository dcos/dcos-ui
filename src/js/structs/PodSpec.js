import ServiceSpec from './ServiceSpec';

module.exports = class PodSpec extends ServiceSpec {
  getLabels() {
    return this.get('labels');
  }

  getContainers() {
    return this.get('containers') || [];
  }

  getContainerCount() {
    return this.getContainers().length;
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

  getContainerSpec(name) {
    let matches = this.getContainers().filter(function (container) {
      return container.name === name;
    });
    if (!matches.length) {
      return null;
    }
    return matches[0];
  }

  getVersion() {
    return this.get('version');
  }

  getScalingInstances() {
    let scaling = this.get('scaling') || {};
    if (!scaling.fixed) {
      return 1;
    }
    return scaling.fixed.instances || 1;
  }
};
