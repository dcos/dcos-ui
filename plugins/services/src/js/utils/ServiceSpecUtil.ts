import Util from "#SRC/js/utils/Util";

import PodSpec from "../structs/PodSpec";
import ApplicationSpec from "../structs/ApplicationSpec";
import FrameworkSpec from "../structs/FrameworkSpec";

const ServiceSpecUtil = {
  /**
   * Creates a new PodSpec with the scaling specifications
   * changed to fixed, and with the number of instances defined
   * from the second argument.
   *
   * @param {PodSpec} spec - The spec to change
   * @param {number} instancesCount - The new number of instances
   * @returns {PodSpec} - Returns a new PodSpec instance
   */
  setPodInstances(spec, instancesCount) {
    const newSpec = Util.deepCopy(spec.get());
    if (!newSpec.scaling) {
      newSpec.scaling = {};
    }
    if (newSpec.scaling.kind !== "fixed") {
      newSpec.scaling = {
        kind: "fixed",
        instances: 1
      };
    }

    newSpec.scaling.instances = instancesCount;

    return new PodSpec(newSpec);
  },

  /**
   * Create a new ApplicationSpec with the instances property
   * set to the instancesCount specified.
   *
   * @param {ApplicationSpec} spec - The spec to change
   * @param {number} instancesCount - The new number of instances
   * @returns {ApplicationSpec} - Returns a new ApplicationSpec instance
   */
  setApplicationInstances(spec, instancesCount) {
    const newSpec = Util.deepCopy(spec.get());
    newSpec.instances = instancesCount;

    return new ApplicationSpec(newSpec);
  },

  /**
   * Create a new FrameworkSpec with the instances property
   * set to the instancesCount specified.
   *
   * @param {FrameworkSpec} spec - The spec to change
   * @param {number} instancesCount - The new number of instances
   * @returns {FrameworkSpec} - Returns a new FrameworkSpec instance
   */
  setFrameworkInstances(spec, instancesCount) {
    const newSpec = Util.deepCopy(spec.get());
    newSpec.instances = instancesCount;

    return new FrameworkSpec(newSpec);
  },

  /**
   * High-level action for picking the correct scaling function according
   * to spec type.
   *
   * @param {PodSpec|ApplicationSpec|FrameworkSpec} spec - The spec to change
   * @param {number} instancesCount - The new number of instances
   * @returns {PodSpec|ApplicationSpec|FrameworkSpec} - Returns a new instance
   */
  setServiceInstances(spec, instancesCount) {
    if (spec instanceof PodSpec) {
      return ServiceSpecUtil.setPodInstances(spec, instancesCount);
    }
    if (spec instanceof FrameworkSpec) {
      return ServiceSpecUtil.setFrameworkInstances(spec, instancesCount);
    }
    if (spec instanceof ApplicationSpec) {
      return ServiceSpecUtil.setApplicationInstances(spec, instancesCount);
    }
  }
};

export default ServiceSpecUtil;
