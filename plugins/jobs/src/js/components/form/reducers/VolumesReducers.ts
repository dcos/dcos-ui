import { deepCopy, findNestedPropertyInObject } from "#SRC/js/utils/Util";

import { JobSpec, JobFormActionType } from "../helpers/JobFormData";

export const volumesReducers = {
  [JobFormActionType.AddArrayItem]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const emptyVolume = {
      containerPath: "",
      hostPath: "",
      mode: ""
    };
    if (!stateCopy.job.run.volumes) {
      stateCopy.job.run.volumes = [];
    }
    if (Array.isArray(stateCopy.job.run.volumes)) {
      stateCopy.job.run.volumes.push(emptyVolume);
    }
    return stateCopy;
  },
  [JobFormActionType.RemoveArrayItem]: (value: number, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const volumes = findNestedPropertyInObject(stateCopy, "job.run.volumes");
    if (volumes && Array.isArray(volumes) && volumes.length >= value + 1) {
      volumes.splice(value, 1);
    }
    return stateCopy;
  },
  [JobFormActionType.Set]: (value: string, state: JobSpec, path: string[]) => {
    const stateCopy = deepCopy(state);
    let volumes = stateCopy.job.run.volumes;
    const [prop, i] = path;
    const index = parseFloat(i);
    if (volumes && Array.isArray(volumes) && volumes.length >= index + 1) {
      if (typeof volumes[index] !== "object") {
        volumes[index] = {
          hostPath: "",
          containerPath: "",
          mode: ""
        };
      }
      volumes[index][prop] = value;
    }
    return stateCopy;
  }
};
