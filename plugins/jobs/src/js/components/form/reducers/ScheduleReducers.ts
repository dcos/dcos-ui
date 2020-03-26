import { deepCopy } from "#SRC/js/utils/Util";

import {
  JobSpec,
  JobFormActionType,
  ConcurrentPolicy,
} from "../helpers/JobFormData";
import { schedulePropertiesCanBeDiscarded } from "../helpers/ScheduleUtil";

export const enabledReducers = {
  [JobFormActionType.Set]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    if (!stateCopy.job.schedules) {
      stateCopy.job.schedules = [];
    }
    if (!stateCopy.job.schedules.length) {
      stateCopy.job.schedules.push({});
    }
    const prevValue = Boolean(stateCopy.job.schedules[0].enabled);
    stateCopy.job.schedules[0].enabled = !prevValue;
    if (schedulePropertiesCanBeDiscarded(stateCopy.job.schedules[0])) {
      stateCopy.job.schedules = undefined;
    }
    return stateCopy;
  },
};

export const concurrencyPolicyReducers = {
  [JobFormActionType.Set]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    if (!stateCopy.job.schedules) {
      stateCopy.job.schedules = [];
    }
    if (!stateCopy.job.schedules.length) {
      stateCopy.job.schedules.push({});
    }
    const prevValue = stateCopy.job.schedules[0].concurrencyPolicy;
    stateCopy.job.schedules[0].concurrencyPolicy =
      !prevValue || prevValue === ConcurrentPolicy.Forbid
        ? (stateCopy.job.schedules[0].concurrencyPolicy =
            ConcurrentPolicy.Allow)
        : (stateCopy.job.schedules[0].concurrencyPolicy =
            ConcurrentPolicy.Forbid);
    if (schedulePropertiesCanBeDiscarded(stateCopy.job.schedules[0])) {
      stateCopy.job.schedules = undefined;
    }
    return stateCopy;
  },
};

function updateScheduleAt(state: JobSpec, path: string[], value: any) {
  const stateCopy = deepCopy(state);
  const assignProp = path[0];
  if (!assignProp) {
    throw Error(`can not set a prop without a path`);
  }
  if (!stateCopy.job.schedules) {
    stateCopy.job.schedules = [];
  }

  if (Array.isArray(stateCopy.job.schedules)) {
    if (!stateCopy.job.schedules.length) {
      stateCopy.job.schedules.push({});
    }
    stateCopy.job.schedules[0][assignProp] = value;
  }

  return stateCopy;
}

export const schedulesReducers = {
  [JobFormActionType.Set]: (value: string, state: JobSpec, path: string[]) => {
    return updateScheduleAt(state, path, value);
  },

  [JobFormActionType.SetNum]: (
    value: string,
    state: JobSpec,
    path: string[]
  ) => {
    const numValue = parseFloat(value);
    const newValue = !isNaN(numValue) ? numValue : "";
    return updateScheduleAt(state, path, newValue);
  },
};
