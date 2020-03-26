import { deepCopy, findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { JobSpec } from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";

export const jobRegionConstraintReducers = {
  SET: (value: string, state: JobSpec, path: string[]): JobSpec => {
    const stateCopy = deepCopy(state);
    let placement = findNestedPropertyInObject(stateCopy, "job.run.placement");
    const [i] = path;
    const index = parseFloat(i);
    const regionConstraint = {
      attribute: "@region",
      operator: "IS",
      value,
      type: "region",
    };
    if (!placement) {
      // Add placement object with empty constraints array if none exists
      const blankPlacement = {
        constraints: [],
      };
      stateCopy.job.run.placement = blankPlacement;
      placement = blankPlacement;
    }
    if (!placement.constraints || !Array.isArray(placement.constraints)) {
      // Add constraints array to placements if placements object exists without constraints prop
      placement.constraints = [];
    }
    if (index >= placement.constraints.length) {
      // The index will be out of the range of the array if it needs to be added
      placement.constraints.push(regionConstraint);
    } else if (value === "" || value == null) {
      // Remove region constraint if from selection is reset to blank
      placement.constraints.splice(index, 1);
    } else {
      // Edit existing region constraint
      placement.constraints[index] = regionConstraint;
    }
    return stateCopy;
  },
};

type ReducerFn = (value: string, state: JobSpec, path: string[]) => JobSpec;

export const jobJsonReducers = (ossJsonReducerFn: ReducerFn) => ({
  OVERRIDE: (value: string, state: JobSpec, path: string[]): JobSpec => {
    const ossState = ossJsonReducerFn(value, state, path);
    const constraints = findNestedPropertyInObject(
      ossState,
      "job.run.placement.constraints"
    );
    if (constraints && Array.isArray(constraints)) {
      for (const constraint of constraints) {
        if (
          constraint.operator === "IS" &&
          constraint.attribute === "@region"
        ) {
          constraint.type = "region";
          break;
        }
      }
    }
    return ossState;
  },
});

export const jobResponseToSpec = (jobSpec: JobSpec): JobSpec => {
  const constraints = findNestedPropertyInObject(
    jobSpec,
    "job.run.placement.constraints"
  );
  if (constraints && Array.isArray(constraints)) {
    for (const constraint of constraints) {
      if (constraint.operator === "IS" && constraint.attribute === "@region") {
        constraint.type = "region";
        break;
      }
    }
  }
  return jobSpec;
};
