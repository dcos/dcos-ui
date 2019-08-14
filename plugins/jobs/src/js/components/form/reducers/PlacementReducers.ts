import { deepCopy, findNestedPropertyInObject } from "#SRC/js/utils/Util";

import { JobSpec, JobFormActionType } from "../helpers/JobFormData";

export const placementReducers = {
  [JobFormActionType.AddArrayItem]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    let placement = findNestedPropertyInObject(stateCopy, "job.run.placement");
    const emptyConstraint = {
      operator: "",
      attribute: "",
      value: ""
    };
    if (!placement) {
      placement = {
        constraints: []
      };
      stateCopy.job.run.placement = placement;
    }
    placement.constraints.push(emptyConstraint);
    return stateCopy;
  },
  [JobFormActionType.RemoveArrayItem]: (value: number, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const placement = findNestedPropertyInObject(
      stateCopy,
      "job.run.placement"
    );
    if (
      placement &&
      placement.constraints &&
      Array.isArray(placement.constraints) &&
      placement.constraints.length >= value + 1
    ) {
      placement.constraints.splice(value, 1);
    }
    return stateCopy;
  },
  [JobFormActionType.Set]: (value: string, state: JobSpec, path: string[]) => {
    const stateCopy = deepCopy(state);
    const placement = findNestedPropertyInObject(
      stateCopy,
      "job.run.placement"
    );
    const [prop, i] = path;
    const index = parseFloat(i);
    if (
      placement &&
      placement.constraints &&
      Array.isArray(placement.constraints) &&
      placement.constraints.length >= index + 1
    ) {
      if (typeof placement.constraints[index] !== "object") {
        placement.constraints[index] = {
          property: "",
          attribute: "",
          value: ""
        };
      }
      placement.constraints[index][prop] = value;
    }
    return stateCopy;
  }
};
