import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { GENERIC } from "../constants/ServiceErrorTypes";

const MarathonPodValidators = {
  /**
   * @param {Object} pod - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  validateProfileVolumes(pod) {
    if (ValidatorUtil.isDefined(pod.volumes)) {
      return pod.volumes.reduce((accumulator, volume, index) => {
        if (
          !ValidatorUtil.isDefined(volume.persistent) ||
          !ValidatorUtil.isDefined(volume.persistent.profileName)
        ) {
          return accumulator;
        }

        if (volume.persistent.type !== "mount") {
          accumulator.push({
            path: ["volumes", index, "persistent", "type"],
            message: "Must be mount for volumes with profile name",
            type: GENERIC,
            variables: { name: "type" }
          });
        }

        return accumulator;
      }, []);
    }

    // No errors
    return [];
  }
};

export default MarathonPodValidators;
