import { deepCopy } from "#SRC/js/utils/Util";

import {
  JobSpec,
  Action,
  JobOutput,
  JobFormActionType,
  Container
} from "../helpers/JobFormData";

const jsonReducers = {
  [JobFormActionType.Override]: (value: JobOutput, state: JobSpec): JobSpec => {
    const stateCopy = deepCopy(state);
    const valueCopy = deepCopy(value);

    if (!valueCopy.job) {
      const newState = {
        job: stateCopy.job,
        schedule: {
          ...stateCopy.schedule,
          ...valueCopy.schedule
        },
        cmdOnly: stateCopy.cmdOnly,
        container: stateCopy.container
      };
      return newState;
    }

    if (!valueCopy.job.run) {
      const newState = {
        cmdOnly: stateCopy.cmdOnly,
        container: stateCopy.container,
        job: {
          ...stateCopy.job,
          ...valueCopy.job
        },
        schedule: valueCopy.schedule
      };
      return newState;
    }

    const cmdOnly = !(valueCopy.job.run.docker || valueCopy.job.run.ucr);

    // Try to assign `container` based first off of whether the new value from JSON contains a `docker` or
    // `ucr` property. If not, check if the previous state had a `container` specified (remember the last container
    // option the user had chosen). Finally, default to "ucr".
    const container = valueCopy.job.run.docker
      ? Container.Docker
      : valueCopy.job.run.ucr
        ? Container.UCR
        : stateCopy.container || Container.UCR;

    const newState = {
      ...stateCopy,
      job: valueCopy.job,
      schedule: valueCopy.schedule,
      cmdOnly,
      container
    };
    if (!newState.job.run.docker) {
      newState.job.run.docker = stateCopy.job.run.docker;
      if (newState.job.run.ucr) {
        newState.job.run.docker.image =
          newState.job.run.ucr.image && newState.job.run.ucr.image.id;
      }
    }
    if (!newState.job.run.ucr) {
      newState.job.run.ucr = stateCopy.job.run.ucr;
      if (newState.job.run.docker) {
        newState.job.run.ucr.image.id = newState.job.run.docker.image;
      }
    }
    return newState;
  }
};

const containerImageReducers = {
  [JobFormActionType.Set]: (value: string, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    if (stateCopy.job.run.ucr) {
      const prevUcrImage = { ...stateCopy.job.run.ucr.image };
      const newUcrImage = {
        id: value
      };
      stateCopy.job.run.ucr.image = {
        ...prevUcrImage,
        ...newUcrImage
      };
    }
    if (stateCopy.job.run.docker) {
      stateCopy.job.run.docker.image = value;
    }
    return stateCopy;
  }
};

const cmdOnlyReducers = {
  [JobFormActionType.Set]: (value: "true" | "false", state: JobSpec) => {
    const stateCopy = deepCopy(state);
    if (value === "true") {
      stateCopy.cmdOnly = true;
    }
    if (value === "false") {
      stateCopy.cmdOnly = false;
    }
    return stateCopy;
  }
};

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

type ReducerFunction = (value: any, state: JobSpec, path?: string[]) => JobSpec;
interface CombinedReducers {
  [key: string]: { [P in JobFormActionType]?: ReducerFunction };
}

const combinedReducers: CombinedReducers = {
  json: jsonReducers,
  containerImage: containerImageReducers,
  cmdOnly: cmdOnlyReducers
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
      return updateFunction(action.value, state);
    }
  }
  updateFunction = defaultSet[action.type];
  if (updateFunction && isFunction(updateFunction)) {
    return updateFunction(action.value, state, arrayPath);
  }

  return state;
}
