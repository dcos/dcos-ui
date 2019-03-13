import { deepCopy } from "#SRC/js/utils/Util";

import { JobSpec, Action, JobFormActionType } from "../helpers/JobFormData";
import { jsonReducers } from "./JsonReducers";
import {
  cmdOnlyReducers,
  argsReducers,
  dockerParamsReducers,
  imageForcePullReducers,
  grantRuntimePrivilegesReducers,
  containerImageReducers
} from "./ContainerReducers";

type DefaultReducerFunction = (
  value: any,
  state: JobSpec,
  path: string[]
) => JobSpec;
type DefaultReducer = { [P in JobFormActionType]?: DefaultReducerFunction };

const defaultReducer: DefaultReducer = {
  [JobFormActionType.Set]: (value: any, state: JobSpec, path: string[]) => {
    const stateCopy = deepCopy(state);
    const assignProp = path.pop();
    if (assignProp) {
      path.reduce((acc: any, current: string) => {
        return acc[current];
      }, stateCopy)[assignProp] = value;
    }

    return stateCopy;
  },
  [JobFormActionType.SetNum]: (value: any, state: JobSpec, path: string[]) => {
    const stateCopy = deepCopy(state);
    const assignProp = path.pop();
    const numValue = parseFloat(value);
    const newValue = !isNaN(numValue) ? numValue : "";
    if (assignProp) {
      path.reduce((acc: any, current: string) => {
        return acc[current];
      }, stateCopy)[assignProp] = newValue;
    }

    return stateCopy;
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
  args: argsReducers
};

const isFunction = (func: any): boolean => {
  return typeof func === "function";
};

export function jobFormOutputToSpecReducer(
  action: Action,
  state: JobSpec
): JobSpec {
  if (!action.path) {
    return state;
  }
  const arrayPath = action.path.split(".");
  const propToChange = arrayPath[arrayPath.length - 1];
  const reducerSet = combinedReducers[propToChange];
  const defaultSet = defaultReducer;
  let updateFunction;

  if (reducerSet) {
    updateFunction = reducerSet[action.type];
    if (updateFunction && isFunction(updateFunction)) {
      return updateFunction(action.value, state, arrayPath);
    }
  }
  updateFunction = defaultSet[action.type];
  if (updateFunction && isFunction(updateFunction)) {
    return updateFunction(action.value, state, arrayPath);
  }

  return state;
}
