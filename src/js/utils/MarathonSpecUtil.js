import PodSpec from '../structs/PodSpec';
import Util from './Util';

var MarathonSpecUtil = {

  /**
   * Namespace for Pod-related spec utilities
   */
  Pods: {

    /**
     * Creates a new PodSpec with the scaling specifications
     * changed to fixed, and with the number of instances defined
     * from the second argument.
     *
     * @param {PodSpec} spec - The spec to change
     * @param {number} instancesCount - The new number of instances
     * @returns {PodSpec} - Returns a new PodSpec instance
     */
    setFixedScaling(spec, instancesCount) {
      var newSpec = Util.deepCopy(spec.get());
      if (!newSpec.scaling) {
        newSpec.scaling = {};
      }
      if (newSpec.scaling.kind !== 'fixed') {
        newSpec.scaling = {
          kind: 'fixed',
          instances: 1
        };
      }

      newSpec.scaling.instances = instancesCount;
      return new PodSpec(newSpec);
    }

  }

};

module.exports = MarathonSpecUtil;
