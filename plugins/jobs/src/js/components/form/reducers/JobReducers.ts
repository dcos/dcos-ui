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

const dockerParamsReducers = {
  [JobFormActionType.AddArrayItem]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const docker = stateCopy.job.run.docker;
    const emptyParam = {
      key: "",
      value: ""
    };
    if (docker) {
      if (!docker.parameters) {
        docker.parameters = [];
      }
      docker.parameters.push(emptyParam);
    }
    return stateCopy;
  },
  [JobFormActionType.RemoveArrayItem]: (value: number, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const docker = stateCopy.job.run.docker;
    if (
      docker &&
      Array.isArray(docker.parameters) &&
      docker.parameters.length >= value + 1
    ) {
      docker.parameters.splice(value, 1);
    }
    return stateCopy;
  },
  [JobFormActionType.Set]: (value: string, state: JobSpec, path: string[]) => {
    const stateCopy = deepCopy(state);
    let docker = stateCopy.job.run.docker;
    const [prop, i] = path;
    const index = parseFloat(i);
    if (
      docker &&
      docker.parameters &&
      Array.isArray(docker.parameters) &&
      docker.parameters.length >= index + 1
    ) {
      docker.parameters[index][prop] = value;
    }
    return stateCopy;
  }
};

const argsReducers = {
  [JobFormActionType.AddArrayItem]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    if (!Array.isArray(stateCopy.job.run.args) || !stateCopy.job.run.args) {
      stateCopy.job.run.args = [];
    }
    stateCopy.job.run.args.push("");
    return stateCopy;
  },
  [JobFormActionType.RemoveArrayItem]: (value: number, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const args = stateCopy.job.run.args;
    if (args && Array.isArray(args) && args.length >= value + 1) {
      args.splice(value, 1);
    }
    return stateCopy;
  },
  [JobFormActionType.Set]: (value: string, state: JobSpec, path: string[]) => {
    const stateCopy = deepCopy(state);
    const args = stateCopy.job.run.args;
    const [i] = path;
    const index = parseFloat(i);
    if (args && Array.isArray(args) && args.length >= index + 1) {
      args[index] = value;
    }
    return stateCopy;
  }
};

const imageForcePullReducers = {
  [JobFormActionType.Set]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const docker = stateCopy.job.run.docker;
    const ucr = stateCopy.job.run.ucr;
    const prevValue = Boolean(
      (docker && docker.forcePullImage) ||
        (ucr && ucr.image && ucr.image.forcePull)
    );
    const newValue = !prevValue;
    if (docker) {
      docker.forcePullImage = newValue;
    }
    if (ucr) {
      ucr.image.forcePull = newValue;
    }
    return stateCopy;
  }
};

const grantRuntimePrivilegesReducers = {
  [JobFormActionType.Set]: (_: any, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const docker = stateCopy.job.run.docker;
    if (docker) {
      const prevValue = Boolean(docker.privileged);
      docker.privileged = !prevValue;
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
