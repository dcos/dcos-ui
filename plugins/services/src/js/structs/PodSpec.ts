import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import ServiceSpec from "./ServiceSpec";

export default class PodSpec extends ServiceSpec {
  scaling?: {
    instances: number;
  };

  getContainers() {
    return this.get("containers") || [];
  }

  getContainerSpec(name) {
    return this.getContainers().find((container) => container.name === name);
  }

  getLabels() {
    return this.get("labels") || {};
  }

  getResources() {
    return this.getContainers().reduce(
      (resources, container) => {
        Object.keys(container.resources).forEach((key) => {
          resources[key] += container.resources[key];
        });

        return resources;
      },
      { cpus: 0, mem: 0, gpus: 0, disk: 0 }
    );
  }

  getScalingInstances() {
    const scaling = this.scaling || { kind: "fixed", instances: 1 };
    return ValidatorUtil.isNumber(scaling.instances) ? scaling.instances : 1;
  }

  getVersion() {
    return this.get("version") || "";
  }

  getVolumes() {
    return this.get("volumes") || [];
  }
}
