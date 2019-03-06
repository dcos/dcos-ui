import { i18nMark } from "@lingui/react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import { JobOutput, FormOutput, FormError, UcrImageKind } from "./JobFormData";

const stringErrorMessage = i18nMark("Must be a string.");
const numberErrorMessage = i18nMark("Must be a number.");
const objectErrorMessage = i18nMark("Must be an object.");
const booleanErrorMessage = i18nMark("Must be a boolean.");

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
    const jobId = findNestedPropertyInObject(formData, "job.id");
    const jobIdRegex = /^[a-z0-9]+([a-z0-9-]+[a-z0-9])?$/;
    const message = i18nMark(
      "ID must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash."
    );
    if (jobId == undefined) {
      return [];
    }
    if (typeof jobId !== "string") {
      return [
        {
          path: ["job", "id"],
          message: stringErrorMessage
        }
      ];
    }
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
    const hasCmd = findNestedPropertyInObject(job, "run.cmd");
    const hasArgs =
      findNestedPropertyInObject(job, "run.args") &&
      (job.run.args as string[]).length;

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
    const docker = findNestedPropertyInObject(job, "run.docker");
    const ucr = findNestedPropertyInObject(job, "run.ucr");
    if (docker || ucr) {
      // Check if it specifies a docker container with image
      if (docker && docker.image) {
        return [];
      }

      // Check if it specifies a UCR container with image and image.id
      if (ucr && ucr.image && ucr.image.id) {
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
    const docker = findNestedPropertyInObject(formData, "job.run.docker");
    if (docker && typeof docker !== "object") {
      return [
        {
          path: ["job", "run", "docker"],
          message: objectErrorMessage
        }
      ];
    }
    if (docker && !docker.image) {
      return [
        {
          path: ["job", "run", "docker", "image"],
          message: i18nMark(
            "Must be specified when using the Docker Engine runtime."
          )
        }
      ];
    }

    const ucr = findNestedPropertyInObject(formData, "job.run.ucr");
    if (ucr && typeof ucr !== "object") {
      return [
        {
          path: ["job", "run", "ucr"],
          message: objectErrorMessage
        }
      ];
    }
    if (ucr && (!ucr.image || !ucr.image.id)) {
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
    const gpus = findNestedPropertyInObject(formData, "job.run.gpus");
    const ucr = findNestedPropertyInObject(formData, "job.run.ucr");
    if ((gpus || gpus === 0) && !ucr) {
      return [
        {
          path: ["job", "run", "gpus"],
          message: i18nMark("GPUs are only available with UCR.")
        }
      ];
    }

    return [];
  },

  oneOfUcrOrDocker(formData: JobOutput) {
    const docker = findNestedPropertyInObject(formData, "job.run.docker");
    const ucr = findNestedPropertyInObject(formData, "job.run.ucr");
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
  },

  /**
   * Ensure job contains the minimum required fields (ID, CPUs, Mem, Disk)
   */
  hasMinimumRequiredFields(formData: JobOutput) {
    const id = findNestedPropertyInObject(formData, "job.id");
    const cpus = findNestedPropertyInObject(formData, "job.run.cpus");
    const mem = findNestedPropertyInObject(formData, "job.run.mem");
    const disk = findNestedPropertyInObject(formData, "job.run.disk");

    const errors = [];

    if (id == undefined) {
      errors.push({
        path: ["job", "id"],
        message: i18nMark("ID is required.")
      });
    }

    if (cpus == undefined) {
      errors.push({
        path: ["job", "run", "cpus"],
        message: i18nMark("CPUs is required.")
      });
    }

    if (mem == undefined) {
      errors.push({
        path: ["job", "run", "mem"],
        message: i18nMark("Mem is required.")
      });
    }

    if (disk == undefined) {
      errors.push({
        path: ["job", "run", "disk"],
        message: i18nMark("Disk is required.")
      });
    }

    return errors;
  },

  checkTypesOfJobRunProps(formData: JobOutput) {
    const cmd = findNestedPropertyInObject(formData, "job.run.cmd");
    const cpus = findNestedPropertyInObject(formData, "job.run.cpus");
    const gpus = findNestedPropertyInObject(formData, "job.run.gpus");
    const mem = findNestedPropertyInObject(formData, "job.run.mem");
    const disk = findNestedPropertyInObject(formData, "job.run.disk");

    const errors: FormError[] = [];

    if (cmd != undefined && typeof cmd !== "string") {
      errors.push({
        path: ["job", "run", "cmd"],
        message: stringErrorMessage
      });
    }
    if (cpus != undefined && typeof cpus !== "number") {
      errors.push({
        path: ["job", "run", "cpus"],
        message: numberErrorMessage
      });
    }
    if (gpus != undefined && typeof gpus !== "number") {
      errors.push({
        path: ["job", "run", "gpus"],
        message: numberErrorMessage
      });
    }
    if (mem != undefined && typeof mem !== "number") {
      errors.push({
        path: ["job", "run", "mem"],
        message: numberErrorMessage
      });
    }
    if (disk != undefined && typeof disk !== "number") {
      errors.push({
        path: ["job", "run", "disk"],
        message: numberErrorMessage
      });
    }
    return errors;
  },

  checkTypesOfDockerProps(formData: JobOutput) {
    const docker = findNestedPropertyInObject(formData, "job.run.docker");
    const errors: FormError[] = [];

    if (docker == undefined) {
      return errors;
    }

    const image = findNestedPropertyInObject(formData, "job.run.docker.image");
    const forcePullImage = findNestedPropertyInObject(
      formData,
      "job.run.docker.forcePullImage"
    );
    const privileged = findNestedPropertyInObject(
      formData,
      "job.run.docker.privileged"
    );
    // Docker parameters are checked separately.

    if (image != undefined && typeof image !== "string") {
      errors.push({
        path: ["job", "run", "docker", "image"],
        message: stringErrorMessage
      });
    }
    if (forcePullImage != undefined && typeof forcePullImage !== "boolean") {
      errors.push({
        path: ["job", "run", "docker", "forcePullImage"],
        message: booleanErrorMessage
      });
    }
    if (privileged != undefined && typeof privileged !== "boolean") {
      errors.push({
        path: ["job", "run", "docker", "privileged"],
        message: booleanErrorMessage
      });
    }
    return errors;
  },

  checkTypesOfUcrProps(formData: JobOutput) {
    const ucr = findNestedPropertyInObject(formData, "job.run.ucr");
    const errors: FormError[] = [];

    if (ucr == undefined) {
      return errors;
    }

    const image = findNestedPropertyInObject(formData, "job.run.ucr.image");
    const privileged = findNestedPropertyInObject(
      formData,
      "job.run.ucr.privileged"
    );
    const id = findNestedPropertyInObject(formData, "job.run.ucr.image.id");
    const kind = findNestedPropertyInObject(formData, "job.run.ucr.image.kind");
    const forcePull = findNestedPropertyInObject(
      formData,
      "job.run.ucr.image.forcePull"
    );

    if (image != undefined && typeof image !== "object") {
      errors.push({
        path: ["job", "run", "ucr", "image"],
        message: objectErrorMessage
      });
    }
    if (privileged != undefined && typeof privileged !== "boolean") {
      errors.push({
        path: ["job", "run", "ucr", "privileged"],
        message: booleanErrorMessage
      });
    }
    if (id != undefined && typeof id !== "string") {
      errors.push({
        path: ["job", "run", "ucr", "image", "id"],
        message: stringErrorMessage
      });
    }
    if (
      kind != undefined &&
      (kind !== UcrImageKind.Docker && kind !== UcrImageKind.Appc)
    ) {
      errors.push({
        path: ["job", "run", "ucr", "image", "kind"],
        message: i18nMark("Image kind must be one of `docker` or `appc`.")
      });
    }
    if (forcePull != undefined && typeof forcePull !== "boolean") {
      errors.push({
        path: ["job", "run", "ucr", "image", "forcePull"],
        message: booleanErrorMessage
      });
    }
    return errors;
  },

  valuesAreWithinRange(formData: JobOutput) {
    const cpus = findNestedPropertyInObject(formData, "job.run.cpus");
    const mem = findNestedPropertyInObject(formData, "job.run.mem");
    const disk = findNestedPropertyInObject(formData, "job.run.disk");
    const errors = [];

    if (cpus != undefined && typeof cpus === "number" && cpus < 0.01) {
      errors.push({
        path: ["job", "run", "cpus"],
        message: i18nMark("Minimum value is 0.01.")
      });
    }

    if (mem != undefined && typeof mem === "number" && mem < 32) {
      errors.push({
        path: ["job", "run", "mem"],
        message: i18nMark("Minimum value is 32.")
      });
    }

    if (disk != undefined && typeof disk === "number" && disk < 0) {
      errors.push({
        path: ["job", "run", "disk"],
        message: i18nMark("Minimum value is 0.")
      });
    }

    return errors;
  },

  gpusWithinRange(formData: JobOutput) {
    const gpus = findNestedPropertyInObject(formData, "job.run.gpus");
    if (gpus && typeof gpus === "number" && gpus < 0) {
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

  noDuplicateArgs(formData: JobOutput) {
    const args = formData.job.run && formData.job.run.args;
    const errors: FormError[] = [];
    const map: { [key: string]: number } = {};
    const dupIndex: number[] = [];

    if (args && Array.isArray(args)) {
      args.forEach((arg, index) => {
        if (!map.hasOwnProperty(arg)) {
          map[arg] = index;
          return;
        }
        if (dupIndex.length === 0) {
          dupIndex.push(map[arg]);
        }
        dupIndex.push(index);
      });

      dupIndex.forEach(errorIndex => {
        errors.push({
          path: ["job", "run", "args", `${errorIndex}`],
          message: i18nMark("No duplicate args.")
        });
      });
    }
    return errors;
  },

  noDuplicateParams(formData: JobOutput) {
    const docker = formData.job.run && formData.job.run.docker;
    const errors: FormError[] = [];
    const map: { [key: string]: number } = {};
    const dupIndex: number[] = [];

    if (docker && docker.parameters && Array.isArray(docker.parameters)) {
      docker.parameters.forEach((param, index) => {
        const paramId = `${param.key}-${param.value}`;
        if (!map.hasOwnProperty(paramId)) {
          map[paramId] = index;
          return;
        }
        if (dupIndex.length === 0) {
          dupIndex.push(map[paramId]);
        }
        dupIndex.push(index);
      });

      dupIndex.forEach(errorIndex => {
        errors.push({
          path: ["job", "run", "docker", "parameters", `${errorIndex}`],
          message: i18nMark("No duplicate parameters.")
        });
      });
    }
    return errors;
  }
};
