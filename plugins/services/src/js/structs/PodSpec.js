import ServiceSpec from "./ServiceSpec";
import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil";

module.exports = class PodSpec extends ServiceSpec {
  getContainers() {
    return this.get("containers") || [];
  }

  getContainerSpec(name) {
    return this.getContainers().find(function(container) {
      return container.name === name;
    });
  }

  getContainerCount() {
    return this.getContainers().length;
  }

  getEnvironment() {
    return this.get("environment") || {};
  }

  getLabels() {
    return this.get("labels") || {};
  }

  getNetworks() {
    return this.get("networks") || [];
  }

  getResources() {
    return this.getContainers().reduce(
      function(resources, container) {
        Object.keys(container.resources).forEach(function(key) {
          resources[key] += container.resources[key];
        });

        return resources;
      },
      {
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      }
    );
  }

  getScaling() {
    return this.get("scaling") || {};
  }

  getScalingInstances() {
    const scaling = this.get("scaling") || { kind: "fixed", instances: 1 };
    if (process.env.NODE_ENV !== "production") {
      if (scaling.kind !== "fixed") {
        throw new TypeError("Unknown scaling type (expecting fixed)");
      }
    }

    if (!ValidatorUtil.isNumber(scaling.instances)) {
      return 1;
    }

    return scaling.instances;
  }

  getSecrets() {
    return this.get("secrets") || {};
  }

  getVersion() {
    return this.get("version") || "";
  }

  getVolumes() {
    return this.get("volumes") || [];
  }

  getUser() {
    return this.get("user") || "";
  }
};
