import { deepCopy } from "#SRC/js/utils/Util";

import { JobSpec, Action, JobFormActionType } from "../helpers/JobFormData";
import { jsonReducers } from "./JsonReducers";
import {
  artifacts,
  labels,
  activeDeadlineSeconds,
  restartPolicy
} from "./RunConfigReducers";
import { stringToBool } from "../Utils";
import {
  cmdOnlyReducers,
  argsReducers,
  dockerParamsReducers,
  imageForcePullReducers,
  grantRuntimePrivilegesReducers,
  containerImageReducers
} from "./ContainerReducers";
import { enabledReducers, concurrencyPolicyReducers } from "./ScheduleReducers";

type DefaultReducerFunction = (
  value: string,
  state: JobSpec,
  path: string[]
) => JobSpec;
type DefaultReducer = { [P in JobFormActionType]?: DefaultReducerFunction };

const updateAt = (state: JobSpec, path: string[], value: any) => {
  const stateCopy = deepCopy(state);
  const assignProp = path.pop();
  if (!assignProp) {
    throw Error(`can not set a prop without a path`);
  }
  path.reduce((acc: any, current) => {
    if (current === "schedule" && !acc[current]) {
      acc[current] = {};
    }
    return acc[current];
  }, stateCopy)[assignProp] = value;

  return stateCopy;
};

const defaultReducer: DefaultReducer = {
  [JobFormActionType.Set]: (value, state, path) => {
    return updateAt(state, path, value);
  },

  [JobFormActionType.SetBool]: (value, state, path) => {
    return updateAt(state, path, stringToBool(value));
  },
  [JobFormActionType.SetNum]: (value, state, path) => {
    const numValue = parseFloat(value);
    const newValue = !isNaN(numValue) ? numValue : "";
    return updateAt(state, path, newValue);
  }
};

type ReducerFunction = (value: any, state: JobSpec, path: string[]) => JobSpec;
interface CombinedReducers {
  [key: string]: { [P in JobFormActionType]?: ReducerFunction };
}

const combinedReducers: CombinedReducers = {
  json: jsonReducers,
  containerImage: containerImageReducers,
  cmdOnly: cmdOnlyReducers,
  dockerParams: dockerParamsReducers,
  imageForcePull: imageForcePullReducers,
  grantRuntimePrivileges: grantRuntimePrivilegesReducers,
  args: argsReducers,
  scheduleEnabled: enabledReducers,
  concurrencyPolicy: concurrencyPolicyReducers,
  labels,
  artifacts,
  activeDeadlineSeconds,
  restartPolicy
};

export function jobFormOutputToSpecReducer(
  action: Action,
  state: JobSpec
): JobSpec {
  const arrayPath = action.path.split(".");
  const propToChange = arrayPath[arrayPath.length - 1];
  const reducer = combinedReducers[propToChange] || defaultReducer;
  const updateFunction = reducer[action.type];

  if (!updateFunction || typeof updateFunction !== "function") {
    throw Error(`no reducer to ${action.type} at ${arrayPath}`);
  }

  return updateFunction(action.value, state, arrayPath);
}
