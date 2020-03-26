import { deepCopy, isObject } from "#SRC/js/utils/Util";

import {
  JobSpec,
  JobOutput,
  JobFormActionType,
  Container,
} from "../helpers/JobFormData";

export const jsonReducers = {
  [JobFormActionType.Override]: (value: JobOutput, state: JobSpec): JobSpec => {
    const stateCopy = deepCopy(state);
    const valueCopy = deepCopy(value);

    if (
      !valueCopy ||
      Object.prototype.toString.call(valueCopy) !== "[object Object]"
    ) {
      return {
        job: stateCopy.job,
        cmdOnly: stateCopy.cmdOnly,
        container: stateCopy.container,
      };
    }

    // Can't check `typeof run === "object"` because that will return true for
    // arrays, null...
    if (
      !valueCopy.run ||
      Object.prototype.toString.call(valueCopy.run) !== "[object Object]"
    ) {
      return {
        cmdOnly: stateCopy.cmdOnly,
        container: stateCopy.container,
        job: {
          ...stateCopy.job,
          ...valueCopy,
          run: {
            ...stateCopy.job.run,
          },
        },
      };
    }

    valueCopy.labels = isObject(valueCopy.labels)
      ? Object.entries(valueCopy.labels)
      : valueCopy.labels;

    valueCopy.run.env = isObject(valueCopy.run.env)
      ? Object.entries(valueCopy.run.env)
      : valueCopy.run.env;

    const cmdOnly = !(valueCopy.run.docker || valueCopy.run.ucr);

    // Try to assign `container` based first off of whether the new value from JSON contains a `docker` or
    // `ucr` property. If not, check if the previous state had a `container` specified (remember the last container
    // option the user had chosen). Finally, default to "ucr".
    const container = valueCopy.run.docker
      ? Container.Docker
      : valueCopy.run.ucr
      ? Container.UCR
      : stateCopy.container || Container.UCR;

    const newState = {
      ...stateCopy,
      job: valueCopy,
      cmdOnly,
      container,
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
  },
};
