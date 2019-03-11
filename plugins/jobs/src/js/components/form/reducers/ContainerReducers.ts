import { deepCopy } from "#SRC/js/utils/Util";

import { JobSpec, JobFormActionType } from "../helpers/JobFormData";

export const cmdOnlyReducers = {
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

export const containerImageReducers = {
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

export const dockerParamsReducers = {
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
      if (typeof docker.parameters[index] !== "object") {
        docker.parameters[index] = {
          key: "",
          value: ""
        };
      }
      docker.parameters[index][prop] = value;
    }
    return stateCopy;
  }
};

export const argsReducers = {
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

export const imageForcePullReducers = {
  [JobFormActionType.Set]: (_: string, state: JobSpec) => {
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

export const grantRuntimePrivilegesReducers = {
  [JobFormActionType.Set]: (_: string, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const docker = stateCopy.job.run.docker;
    if (docker) {
      const prevValue = Boolean(docker.privileged);
      docker.privileged = !prevValue;
    }
    return stateCopy;
  }
};
