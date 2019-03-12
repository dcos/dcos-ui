import { deepCopy } from "#SRC/js/utils/Util";

import {
  JobSpec,
  JobOutput,
  JobFormActionType,
  Container
} from "../helpers/JobFormData";

export const jsonReducers = {
  [JobFormActionType.Override]: (value: JobOutput, state: JobSpec): JobSpec => {
    const stateCopy = deepCopy(state);
    const valueCopy = deepCopy(value);

    if (
      !valueCopy.job ||
      Object.prototype.toString.call(valueCopy.job) !== "[object Object]"
    ) {
      const newState = {
        job: stateCopy.job,
        schedule: {
          ...stateCopy.schedule,
          ...valueCopy.schedule
        },
        cmdOnly: stateCopy.cmdOnly,
        container: stateCopy.container
      };
      if (!Object.keys(newState.schedule).length) {
        newState.schedule = undefined;
      }
      return newState;
    }

    // Can't check `typeof run === "object"` because that will return true for
    // arrays, null...
    if (
      !valueCopy.job.run ||
      Object.prototype.toString.call(valueCopy.job.run) !== "[object Object]"
    ) {
      const newState = {
        cmdOnly: stateCopy.cmdOnly,
        container: stateCopy.container,
        job: {
          ...stateCopy.job,
          ...valueCopy.job,
          run: {
            ...stateCopy.job.run
          }
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
