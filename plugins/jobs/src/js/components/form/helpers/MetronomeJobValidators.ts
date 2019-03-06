import { i18nMark } from "@lingui/react";

import { JobOutput, FormOutput, FormError } from "./JobFormData";

export const MetronomeUiValidators = {
  /**
   * Returns whether a field is required based on current state of form data.
   */
  fieldIsRequired(fieldName: string, formData: FormOutput): boolean {
    switch (fieldName) {
      case "cmd":
        return formData.cmdOnly;
      case "image":
        return !formData.cmdOnly;
      default:
        return false;
    }
  },

  /**
   * Returns whether a field is disabled based on current state of form data.
   */
  fieldIsDisabled(fieldName: string, formData: FormOutput): boolean {
    switch (fieldName) {
      case "gpus":
        return formData.cmdOnly || !(formData.container === "ucr");
      case "ucr":
      case "docker":
        return formData.cmdOnly;
      default:
        return false;
    }
  },

  /**
   * Returns whether a field is shown based on current state of form data.
   */
  fieldIsShown(fieldName: string, formData: FormOutput): boolean {
    switch (fieldName) {
      case "ucr":
        return !(formData.container === "docker");
      case "docker":
        return !(formData.container === "docker");
      default:
        return true;
    }
  }
};

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
    const message = i18nMark(
      "ID must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash."
    );
    return jobId && jobIdRegex.test(jobId)
      ? []
      : [{ path: ["job", "id"], message }];
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
      const notBothMessage = i18nMark(
        "Please specify only one of `cmd` or `args`."
      );

      return [
        {
          path: ["job", "run", "cmd"],
          message: notBothMessage
        },
        {
          path: ["job", "run", "args"],
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

    const message = i18nMark(
      "You must specify a command, an argument or a container with an image."
    );

    const containerImageErrorPath = job.run.ucr
      ? ["job", "run", "ucr", "image", "id"]
      : job.run.docker
        ? ["job", "run", "docker", "image"]
        : [];

    return [
      { path: ["job", "run", "cmd"], message },
      { path: ["job", "run", "args"], message },
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
          path: ["job", "run", "docker", "image"],
          message: i18nMark(
            "Must be specified when using the Docker Engine runtime."
          )
        }
      ];
    }

    if (job.run.ucr && (!job.run.ucr.image || !job.run.ucr.image.id)) {
      return [
        {
          path: ["job", "run", "ucr", "image", "id"],
          message: i18nMark("Must be specified when using UCR.")
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
          path: ["job", "run", "gpus"],
          message: i18nMark("GPUs are only available with UCR.")
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
        path: ["job", "id"],
        message: i18nMark("ID is required.")
      });
    }

    if (!cpus && cpus !== 0) {
      errors.push({
        path: ["job", "run", "cpus"],
        message: i18nMark("CPUs is required.")
      });
    }

    if (!mem && mem !== 0) {
      errors.push({
        path: ["job", "run", "mem"],
        message: i18nMark("Mem is required.")
      });
    }

    if (!disk && disk !== 0) {
      errors.push({
        path: ["job", "run", "disk"],
        message: i18nMark("Disk is required.")
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

    if (cpus < 0.01) {
      errors.push({
        path: ["job", "run", "cpus"],
        message: i18nMark("Minimum value is 0.01.")
      });
    }

    if (mem < 32) {
      errors.push({
        path: ["job", "run", "mem"],
        message: i18nMark("Minimum value is 32.")
      });
    }

    if (disk < 0) {
      errors.push({
        path: ["job", "run", "disk"],
        message: i18nMark("Minimum value is 0.")
      });
    }

    return errors;
  },

  gpusWithinRange(formData: JobOutput) {
    const gpus = formData.job.run.gpus;
    if (gpus && gpus < 0) {
      return [
        {
          path: ["job", "run", "gpus"],
          message: i18nMark("Minimum value is 0.")
        }
      ];
    }
    return [];
  },

  parametersHaveStringKeyAndValue(formData: JobOutput) {
    const docker = formData.job.run.docker;
    const errors: FormError[] = [];
    if (docker && docker.parameters) {
      if (!Array.isArray(docker.parameters)) {
        return [
          {
            path: ["job", "run", "docker", "parameters"],
            message: i18nMark("Parameters must be an array.")
          }
        ];
      }
      docker.parameters.forEach((parameter, index) => {
        if (!parameter.key) {
          errors.push({
            path: ["job", "run", "docker", "parameters", `${index}`, "key"],
            message: i18nMark("Key cannot be empty.")
          });
        } else if (typeof parameter.key !== "string") {
          errors.push({
            path: ["job", "run", "docker", "parameters", `${index}`, "key"],
            message: i18nMark("Key must be a string.")
          });
        }
        if (!parameter.value) {
          errors.push({
            path: ["job", "run", "docker", "parameters", `${index}`, "value"],
            message: i18nMark("Value cannot be empty.")
          });
        } else if (typeof parameter.value !== "string") {
          errors.push({
            path: ["job", "run", "docker", "parameters", `${index}`, "value"],
            message: i18nMark("Value must be a string.")
          });
        }
      });
    }
    return errors;
  },

  noEmptyArgs(formData: JobOutput) {
    const args = formData.job.run.args;
    const errors: FormError[] = [];
    if (args && Array.isArray(args)) {
      args.forEach((arg, index) => {
        if (arg === "" || arg == undefined) {
          errors.push({
            path: ["job", "run", "args", `${index}`],
            message: i18nMark("Arg cannot be empty.")
          });
        }
      });
    }
    return errors;
  },

  argsAreArray(formData: JobOutput) {
    const args = formData.job.run.args;
    if (args && !Array.isArray(args)) {
      return [
        {
          path: ["job", "run", "args"],
          message: i18nMark("Args must be an array.")
        }
      ];
    }
    return [];
  },

  argsUsedOnlyWithDocker(formData: JobOutput) {
    const args = formData.job.run.args;
    const docker = formData.job.run.docker;

    if (args && !docker) {
      return [
        {
          path: ["job", "run", "args"],
          message: i18nMark("Args can only be used with Docker.")
        }
      ];
    }
    return [];
  },

  argsAreStrings(formData: JobOutput) {
    const args = formData.job.run.args;
    const errors: FormError[] = [];

    if (args) {
      if (!Array.isArray(args)) {
        return [
          {
            path: ["job", "run", "args"],
            message: i18nMark("Args must be a string array.")
          }
        ];
      }
      args.forEach((arg, index) => {
        if (!(typeof arg === "string")) {
          errors.push({
            path: ["job", "run", "args", `${index}`],
            message: i18nMark("Arg must be a string")
          });
        }
      });
    }
    return errors;
  },

  oneOfUcrOrDocker(formData: JobOutput) {
    const docker = formData.job.run.docker;
    const ucr = formData.job.run.ucr;
    if (docker && ucr) {
      return [
        {
          path: ["job", "run", "docker"],
          message: i18nMark("Only one of UCR or Docker is allowed.")
        },
        {
          path: ["job", "run", "ucr"],
          message: i18nMark("Only one of UCR or Docker is allowed.")
        }
      ];
    }
    return [];
  }
};
