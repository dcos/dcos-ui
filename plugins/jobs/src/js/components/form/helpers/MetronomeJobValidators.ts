import { JobOutput, FormError } from "./JobFormData";

interface MetronomeValidators {
  [key: string]: (formData: JobOutput) => FormError[];
}

export const MetronomeSpecValidators: MetronomeValidators = {
  /**
   * Ensure ID contains only allowed characters.
   */
  jobIdIsValid(formData: JobOutput): FormError[] {
    const jobId = formData.job.id;
    const jobIdRegex = /^[a-z0-9]+([a-z0-9-]+[a-z0-9])?$/;
    const message =
      "ID must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash.";
    return jobId && jobIdRegex.test(jobId) ? [] : [{ path: ["id"], message }];
  },

  /**
   * Ensure that the user has provided either one of `cmd` or `args`, or a container image field.
   * Ensure that the user has not provided both `cmd` and `args`.
   */
  containsCmdArgsOrContainer(formData: JobOutput): FormError[] {
    const { job } = formData;
    const hasCmd = job.run.cmd;
    const hasArgs = job.run.args && job.run.args.length;

    // Dont accept both `args` and `cmd`
    if (hasCmd && hasArgs) {
      const notBothMessage = "Please specify only one of `cmd` or `args`";

      return [
        {
          path: ["run", "cmd"],
          message: notBothMessage
        },
        {
          path: ["run", "args"],
          message: notBothMessage
        }
      ];
    }

    // Check if we have either of them
    if (hasCmd || hasArgs) {
      return [];
    }

    // Additional checks if we have container
    if (job.run.docker || job.run.ucr) {
      // Check if it specifies a docker container with image
      if (job.run.docker && job.run.docker.image) {
        return [];
      }

      // Check if it specifies a UCR container with image and image.id
      if (job.run.ucr && job.run.ucr.image && job.run.ucr.image.id) {
        return [];
      }
    }

    const message =
      "You must specify a command, an argument or a container with an image";

    const containerImageErrorPath = job.run.ucr
      ? ["run", "ucr", "image", "id"]
      : job.run.docker
        ? ["run", "docker", "image"]
        : [];

    return [
      { path: ["run", "cmd"], message },
      { path: ["run", "args"], message },
      {
        path: containerImageErrorPath,
        message
      }
    ];
  },

  /**
   * Ensure there is a container image if a container is specified
   */
  mustContainImageOnDockerOrUCR(formData: JobOutput) {
    const { job } = formData;
    if (job.run.docker && !job.run.docker.image) {
      return [
        {
          path: ["run", "docker", "image"],
          message: "Must be specified when using the Docker Engine runtime."
        }
      ];
    }

    if (job.run.ucr && (!job.run.ucr.image || !job.run.ucr.image.id)) {
      return [
        {
          path: ["run", "ucr", "image", "id"],
          message: "Must be specified when using UCR."
        }
      ];
    }

    return [];
  },

  /**
   * Ensure GPUs are used only with UCR
   */
  gpusOnlyWithUCR(formData: JobOutput) {
    const { job } = formData;
    if ((job.run.gpus || job.run.gpus === 0) && !job.run.ucr) {
      return [
        {
          path: ["run", "gpus"],
          message: "GPUs are only available with UCR."
        }
      ];
    }

    return [];
  },

  /**
   * Ensure job contains the minimum required fields (ID, CPUs, Mem, Disk)
   */
  hasMinimumRequiredFields(formData: JobOutput) {
    const {
      job: {
        id,
        run: { cpus, mem, disk }
      }
    } = formData;
    const errors = [];

    if (!id) {
      errors.push({
        path: ["id"],
        message: "ID is required."
      });
    }

    if (!cpus && cpus !== 0) {
      errors.push({
        path: ["run.cpus"],
        message: "CPUs is required."
      });
    }

    if (!mem && mem !== 0) {
      errors.push({
        path: ["run.mem"],
        message: "Mem is required."
      });
    }

    if (!disk && disk !== 0) {
      errors.push({
        path: ["run.disk"],
        message: "Disk is required."
      });
    }

    return errors;
  },

  valuesAreWithinRange(formData: JobOutput) {
    const {
      job: {
        run: { cpus, mem, disk }
      }
    } = formData;
    const errors = [];

    if (cpus < 0.1) {
      errors.push({
        path: ["run", "cpus"],
        message: "Minimum value is 0.1."
      });
    }

    if (mem < 32) {
      errors.push({
        path: ["run", "mem"],
        message: "Minimum value is 32."
      });
    }

    if (disk < 0) {
      errors.push({
        path: ["run", "disk"],
        message: "Minimum value is 0."
      });
    }

    return errors;
  }
};
