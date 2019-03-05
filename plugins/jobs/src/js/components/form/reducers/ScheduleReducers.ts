import { deepCopy } from "#SRC/js/utils/Util";

import {
  JobSpec,
  JobFormActionType,
  ConcurrentPolicy
} from "../helpers/JobFormData";
import { schedulePropertiesCanBeDiscarded } from "../helpers/ScheduleUtil";

export const enabledReducers = {
  [JobFormActionType.Set]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    if (!stateCopy.schedule) {
      stateCopy.schedule = {};
    }
    const prevValue = Boolean(stateCopy.schedule.enabled);
    stateCopy.schedule.enabled = !prevValue;
    if (schedulePropertiesCanBeDiscarded(stateCopy.schedule)) {
      stateCopy.schedule = undefined;
    }
    return stateCopy;
  }
};

export const concurrentPolicyReducers = {
  [JobFormActionType.Set]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    if (!stateCopy.schedule) {
      stateCopy.schedule = {};
    }
    const prevValue = stateCopy.schedule.concurrentPolicy;
    stateCopy.schedule.concurrentPolicy =
      !prevValue || prevValue === ConcurrentPolicy.Forbid
        ? (stateCopy.schedule.concurrentPolicy = ConcurrentPolicy.Allow)
        : (stateCopy.schedule.concurrentPolicy = ConcurrentPolicy.Forbid);
    if (schedulePropertiesCanBeDiscarded(stateCopy.schedule)) {
      stateCopy.schedule = undefined;
    }
    return stateCopy;
  }
};
