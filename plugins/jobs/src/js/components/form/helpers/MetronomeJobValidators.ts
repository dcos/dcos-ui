import { i18nMark } from "@lingui/react";
import { pipe } from "rxjs";

import {
  isObject as isObjectUtil,
  findNestedPropertyInObject
} from "#SRC/js/utils/Util";

import { JobOutput, FormError, UcrImageKind, JobSpec } from "./JobFormData";

type MetronomeValidators = Record<string, (formData: JobOutput) => FormError[]>;

// TODO: can be removed once we're on TS3, as it seems flatMap-support has landed there.
const flatMap = <A, B>(map: (x: A, i: number) => B[], xs: A[]): B[] =>
  xs.reduce((acc, x, i) => acc.concat(map(x, i)), [] as B[]);

const validation = <T>(isValid: (val: T) => boolean, message: string) => (
  path: (i: number) => string,
  values: T[]
) => (errors: FormError[]) =>
  errors.concat(
    flatMap(
      (value, index) =>
        isValid(value) ? [] : [{ message, path: path(index).split(".") }],
      values
    )
  );

const isBoolean = validation<boolean | undefined>(
  x => x === undefined || typeof x === "boolean",
  i18nMark("Must be a boolean.")
);
const isNumber = validation<number | undefined>(
  x => x === undefined || typeof x === "number",
  i18nMark("Must be a number.")
);
const isObject = validation<object | undefined>(
  x => x === undefined || isObjectUtil(x),
  i18nMark("Must be an object.")
);
const isPresent = validation<any>(
  x => x !== undefined && x !== "",
  i18nMark("Must be present.")
);
const isString = validation<string | undefined>(
  x => x === undefined || typeof x === "string",
  i18nMark("Must be a string.")
);

export const MetronomeSpecValidators: MetronomeValidators = {
  validate(formData: JobOutput): FormError[] {
    const { run } = formData.job;
    const parameters = (run.docker && run.docker.parameters) || [];

    // prettier-ignore
    return pipe(
      // IS BOOLEAN

      isBoolean(_ => "job.run.docker.forcePullImage", [run.docker && run.docker.forcePullImage]),
      isBoolean(_ => "job.run.docker.privileged", [run.docker && run.docker.privileged]),
      isBoolean(_ => "job.run.ucr.privileged", [run.ucr && run.ucr.privileged]),
      isBoolean(_ => "job.run.ucr.image.forcePull", [run.ucr && run.ucr.image&& run.ucr.image.forcePull]),

      // IS NUMBER

      isNumber(_ => "job.run.cpus", [run.cpus]),
      isNumber(_ => "job.run.disk", [run.disk]),
      isNumber(_ => "job.run.gpus", [run.gpus]),
      isNumber(_ => "job.run.maxLaunchDelay", [run.maxLaunchDelay]),
      isNumber(_ => "job.run.mem", [run.mem]),
      isNumber(_ => "job.run.restart.activeDeadlineSeconds", [run.restart && run.restart.activeDeadlineSeconds]),
      isNumber(_ => "job.run.taskKillGracePeriodSeconds", [run.taskKillGracePeriodSeconds]),

      // IS OBJECT

      isObject(_ => "job.labels", [formData.job.labels]),
      isObject(_ => "job.run.docker", [run.docker]),
      isObject(_ => "job.run.ucr", [run.ucr]),
      isObject(_ => "job.run.ucr.image", [run.ucr && run.ucr.image]),

      // IS PRESENT

      isPresent(_ => "job.id", [formData.job.id]),
      isPresent(_ => "job.run.cpus", [run.cpus]),
      isPresent(_ => "job.run.disk", [run.disk]),
      isPresent(_ => "job.run.mem", [run.mem]),
      isPresent(i => `job.labels.${i}.key`, Object.keys(formData.job.labels || [])),
      isPresent(i => `job.run.artifacts.${i}.uri`, (run.artifacts || []).map(_ => _.uri)),
      isPresent(i => `job.run.docker.parameters.${i}.key`, parameters.map(_ => _.key)),
      isPresent(i => `job.run.docker.parameters.${i}.value`, parameters.map(_ => _.value)),

      // IS STRING

      isString(_ => "job.id", [formData.job.id]),
      isString(_ => "job.run.cmd", [run.cmd]),
      isString(_ => "job.run.docker.image", [run.docker && run.docker.image]),
      isString(_ => "job.run.restart.policy", [run.restart && run.restart.policy]),
      isString(_ => "job.run.ucr.image.id", [run.ucr && run.ucr.image && run.ucr.image.id]),
      isString(_ => "job.run.user", [run.user]),
      isString(i => `job.labels.${i}.key`, Object.keys(formData.job.labels || [])),
      isString(i => `job.labels.${i}.value`, Object.values(formData.job.labels || [])),
      isString(i => `job.run.args.${i}`, run.args || []),
      isString(i => `job.run.artifacts.${i}.uri`, (run.artifacts || []).map(_ => _.uri)),
      isString(i => `job.run.docker.parameters.${i}.key`, parameters.map(_ => _.key)),
      isString(i => `job.run.docker.parameters.${i}.value`, parameters.map(_ => _.value))

      // pipe only infers 10 steps, so we need a cast here
    )([]) as FormError[];
  },

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
      { path: containerImageErrorPath, message }
    ];
  },

  /**
   * Ensure there is a container image if a container is specified
   */
  mustContainImageOnDockerOrUCR(formData: JobOutput) {
    const docker = findNestedPropertyInObject(formData, "job.run.docker");
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

  checkTypesOfUcrProps(formData: JobOutput) {
    const ucr = findNestedPropertyInObject(formData, "job.run.ucr");
    const errors: FormError[] = [];

    if (ucr == undefined) {
      return errors;
    }

    const kind = findNestedPropertyInObject(formData, "job.run.ucr.image.kind");

    if (
      kind != undefined &&
      (kind !== UcrImageKind.Docker && kind !== UcrImageKind.Appc)
    ) {
      errors.push({
        path: ["job", "run", "ucr", "image", "kind"],
        message: i18nMark("Image kind must be one of `docker` or `appc`.")
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
  },

  scheduleHasId(formData: JobOutput) {
    const { schedule } = formData;
    if (schedule && !schedule.id) {
      return [
        {
          path: ["schedule", "id"],
          message: i18nMark("ID is required.")
        }
      ];
    }
    return [];
  },

  scheduleHasCron(formData: JobOutput) {
    const { schedule } = formData;
    if (schedule && !schedule.cron) {
      return [
        {
          path: ["schedule", "cron"],
          message: i18nMark("CRON schedule is required.")
        }
      ];
    }
    return [];
  },

  scheduleIdIsValid(formData: JobOutput) {
    const { schedule } = formData;
    const idRegex = /^[a-z0-9]+([a-z0-9-]+[a-z0-9])?$/;
    const message = i18nMark(
      "ID must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash."
    );
    if (!schedule) {
      return [];
    }
    if (schedule.id && typeof schedule.id !== "string") {
      return [
        {
          path: ["schedule", "id"],
          message: i18nMark("Schedule ID must be a string.")
        }
      ];
    }
    return schedule && schedule.id && idRegex.test(schedule.id)
      ? []
      : [{ path: ["schedule", "id"], message }];
  },

  scheduleStartingDeadlineIsValid(formData: JobOutput) {
    const { schedule } = formData;
    const errors = [];
    if (schedule && schedule.startingDeadlineSeconds != undefined) {
      if (typeof schedule.startingDeadlineSeconds !== "number") {
        errors.push({
          path: ["schedule", "startingDeadlineSeconds"],
          message: i18nMark("Starting deadline must be a number.")
        });
      }
      if (schedule.startingDeadlineSeconds < 1) {
        errors.push({
          path: ["schedule", "startingDeadlineSeconds"],
          message: i18nMark("Minimum value is 1.")
        });
      }
    }
    return errors;
  }
};

export function validateFormLabels(jobSpec: JobSpec): FormError[] {
  const labels = jobSpec.job.labels;
  const errors: FormError[] = [];
  const map: { [key: string]: number } = {};
  const dupIndex: number[] = [];
  const errorMessage = i18nMark(
    "Cannot have multiple labels with the same key."
  );

  if (!labels) {
    return errors;
  }
  labels.forEach(([key], i) => {
    if (!map.hasOwnProperty(key)) {
      map[key] = i;
      return;
    }
    if (dupIndex.length === 0) {
      dupIndex.push(map[key]);
    }
    dupIndex.push(i);
  });
  if (dupIndex.length > 0) {
    // This error has path to ensure that error is visible in JSON editor
    errors.push({
      path: ["job", "labels"],
      message: errorMessage
    });
  }
  dupIndex.forEach(errorIndex => {
    // These errors have path to ensure that error is visible on correct form inputs
    errors.push({
      path: ["job", "labels", `${errorIndex}`],
      message: errorMessage
    });
  });
  return errors;
}
