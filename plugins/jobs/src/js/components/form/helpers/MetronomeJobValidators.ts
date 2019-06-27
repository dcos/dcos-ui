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

const validation = <T>(
  isValid: (val: T) => boolean,
  defaultMessage: string
) => (path: (i: number) => string, values: T[], message = defaultMessage) => (
  errors: FormError[]
) =>
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

const allUniq = validation<any[]>(
  list => new Set(list).size === list.length,
  i18nMark("All elements must be unique.")
);

const isUniqIn = <T>(list: T[]) =>
  validation<T>(
    (el: T) => list.filter(x => x === el).length < 2,
    i18nMark("Must be unique.")
  );

export const MetronomeSpecValidators: MetronomeValidators = {
  validate(formData: JobOutput): FormError[] {
    const { run } = formData;
    const parameters = (run.docker && run.docker.parameters) || [];

    // prettier-ignore
    return pipe(
      // IS BOOLEAN

      isBoolean(_ => "run.docker.forcePullImage", [run.docker && run.docker.forcePullImage]),
      isBoolean(_ => "run.docker.privileged", [run.docker && run.docker.privileged]),
      isBoolean(_ => "run.ucr.privileged", [run.ucr && run.ucr.privileged]),
      isBoolean(_ => "run.ucr.image.forcePull", [run.ucr && run.ucr.image&& run.ucr.image.forcePull]),

      // IS NUMBER

      isNumber(_ => "run.cpus", [run.cpus]),
      isNumber(_ => "run.disk", [run.disk]),
      isNumber(_ => "run.gpus", [run.gpus]),
      isNumber(_ => "run.maxLaunchDelay", [run.maxLaunchDelay]),
      isNumber(_ => "run.mem", [run.mem]),
      isNumber(_ => "run.restart.activeDeadlineSeconds", [run.restart && run.restart.activeDeadlineSeconds]),
      isNumber(_ => "run.taskKillGracePeriodSeconds", [run.taskKillGracePeriodSeconds]),

      // IS OBJECT

      isObject(_ => "labels", [formData.labels]),
      isObject(_ => "run.docker", [run.docker]),
      isObject(_ => "run.ucr", [run.ucr]),
      isObject(_ => "run.ucr.image", [run.ucr && run.ucr.image]),

      // IS PRESENT

      isPresent(_ => "id", [formData.id]),
      isPresent(_ => "run.cpus", [run.cpus]),
      isPresent(_ => "run.disk", [run.disk]),
      isPresent(_ => "run.mem", [run.mem]),
      isPresent(i => `labels.${i}.key`, Object.keys(formData.labels || [])),
      isPresent(i => `run.artifacts.${i}.uri`, (run.artifacts || []).map(_ => _.uri)),
      isPresent(i => `run.docker.parameters.${i}.key`, parameters.map(_ => _.key)),
      isPresent(i => `run.docker.parameters.${i}.value`, parameters.map(_ => _.value)),

      // IS STRING

      isString(_ => "id", [formData.id]),
      isString(_ => "run.cmd", [run.cmd]),
      isString(_ => "run.docker.image", [run.docker && run.docker.image]),
      isString(_ => "run.restart.policy", [run.restart && run.restart.policy]),
      isString(_ => "run.ucr.image.id", [run.ucr && run.ucr.image && run.ucr.image.id]),
      isString(_ => "run.user", [run.user]),
      isString(i => `labels.${i}.key`, Object.keys(formData.labels || [])),
      isString(i => `labels.${i}.value`, Object.values(formData.labels || [])),
      isString(i => `run.args.${i}`, run.args || []),
      isString(i => `run.artifacts.${i}.uri`, (run.artifacts || []).map(_ => _.uri)),
      isString(i => `run.docker.parameters.${i}.key`, parameters.map(_ => _.key)),
      isString(i => `run.docker.parameters.${i}.value`, parameters.map(_ => _.value))

      // pipe only infers 10 steps, so we need a cast here
    )([]) as FormError[];
  },

  /**
   * Ensure ID contains only allowed characters.
   */
  jobIdIsValid(formData: JobOutput): FormError[] {
    const jobId = findNestedPropertyInObject(formData, "id");
    const jobIdRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9]+)*)([.][a-z0-9]([a-z0-9-]*[a-z0-9]+)*)*$/;
    const message = i18nMark(
      "ID must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash."
    );
    if (jobId == undefined) {
      return [];
    }
    return jobId && jobIdRegex.test(jobId) ? [] : [{ path: ["id"], message }];
  },

  /**
   * Ensure that the user has provided either one of `cmd` or `args`, or a container image field.
   * Ensure that the user has not provided both `cmd` and `args`.
   */
  containsCmdArgsOrContainer(job: JobOutput): FormError[] {
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
      ? ["run", "ucr", "image", "id"]
      : job.run.docker
      ? ["run", "docker", "image"]
      : [];

    return [
      { path: ["run", "cmd"], message },
      { path: ["run", "args"], message },
      { path: containerImageErrorPath, message }
    ];
  },

  /**
   * Ensure there is a container image if a container is specified
   */
  mustContainImageOnDockerOrUCR(formData: JobOutput) {
    const docker = findNestedPropertyInObject(formData, "run.docker");
    if (docker && !docker.image) {
      return [
        {
          path: ["run", "docker", "image"],
          message: i18nMark(
            "Must be specified when using the Docker Engine runtime."
          )
        }
      ];
    }

    const ucr = findNestedPropertyInObject(formData, "run.ucr");
    if (ucr && (!ucr.image || !ucr.image.id)) {
      return [
        {
          path: ["run", "ucr", "image", "id"],
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
    const gpus = findNestedPropertyInObject(formData, "run.gpus");
    const docker = findNestedPropertyInObject(formData, "run.docker");
    if ((gpus || gpus === 0) && docker) {
      return [
        {
          path: ["run", "gpus"],
          message: i18nMark("GPUs are only available with UCR.")
        }
      ];
    }

    return [];
  },

  oneOfUcrOrDocker(formData: JobOutput) {
    const docker = findNestedPropertyInObject(formData, "run.docker");
    const ucr = findNestedPropertyInObject(formData, "run.ucr");
    if (docker && ucr) {
      return [
        {
          path: ["run", "docker"],
          message: i18nMark("Only one of UCR or Docker is allowed.")
        },
        {
          path: ["run", "ucr"],
          message: i18nMark("Only one of UCR or Docker is allowed.")
        }
      ];
    }
    return [];
  },

  checkTypesOfUcrProps(formData: JobOutput) {
    const ucr = findNestedPropertyInObject(formData, "run.ucr");
    const errors: FormError[] = [];

    if (ucr == undefined) {
      return errors;
    }

    const kind = findNestedPropertyInObject(formData, "run.ucr.image.kind");

    if (
      kind != undefined &&
      (kind !== UcrImageKind.Docker && kind !== UcrImageKind.Appc)
    ) {
      errors.push({
        path: ["run", "ucr", "image", "kind"],
        message: i18nMark("Image kind must be one of `docker` or `appc`.")
      });
    }
    return errors;
  },

  valuesAreWithinRange(formData: JobOutput) {
    const cpus = findNestedPropertyInObject(formData, "run.cpus");
    const mem = findNestedPropertyInObject(formData, "run.mem");
    const disk = findNestedPropertyInObject(formData, "run.disk");
    const errors = [];

    if (cpus != undefined && typeof cpus === "number" && cpus < 0.01) {
      errors.push({
        path: ["run", "cpus"],
        message: i18nMark("Minimum value is 0.01.")
      });
    }

    if (mem != undefined && typeof mem === "number" && mem < 32) {
      errors.push({
        path: ["run", "mem"],
        message: i18nMark("Minimum value is 32.")
      });
    }

    if (disk != undefined && typeof disk === "number" && disk < 0) {
      errors.push({
        path: ["run", "disk"],
        message: i18nMark("Minimum value is 0.")
      });
    }

    return errors;
  },

  gpusWithinRange(formData: JobOutput) {
    const gpus = findNestedPropertyInObject(formData, "run.gpus");
    if (gpus && typeof gpus === "number" && gpus < 0) {
      return [
        {
          path: ["run", "gpus"],
          message: i18nMark("Minimum value is 0.")
        }
      ];
    }
    return [];
  },

  noEmptyArgs(formData: JobOutput) {
    const args = formData.run.args;
    const errors: FormError[] = [];
    if (args && Array.isArray(args)) {
      args.forEach((arg, index) => {
        if (arg === "" || arg == undefined) {
          errors.push({
            path: ["run", "args", `${index}`],
            message: i18nMark("Arg cannot be empty.")
          });
        }
      });
    }
    return errors;
  },

  argsUsedOnlyWithDocker(formData: JobOutput) {
    const args = formData.run.args;
    const docker = formData.run.docker;

    if (args && !docker) {
      return [
        {
          path: ["run", "args"],
          message: i18nMark("Args can only be used with Docker.")
        }
      ];
    }
    return [];
  },

  noDuplicateArgs(formData: JobOutput) {
    const args = formData.run && formData.run.args;
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
          path: ["run", "args", `${errorIndex}`],
          message: i18nMark("No duplicate args.")
        });
      });
    }
    return errors;
  },

  noDuplicateParams(formData: JobOutput) {
    const docker = formData.run && formData.run.docker;
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
          path: ["run", "docker", "parameters", `${errorIndex}`],
          message: i18nMark("No duplicate parameters.")
        });
      });
    }
    return errors;
  },

  scheduleHasId(formData: JobOutput) {
    const { schedules } = formData;
    if (
      schedules &&
      Array.isArray(schedules) &&
      schedules.length &&
      !schedules[0].id
    ) {
      return [
        {
          path: ["schedules", "0", "id"],
          message: i18nMark("ID is required.")
        }
      ];
    }
    return [];
  },

  scheduleHasCron(formData: JobOutput) {
    const { schedules } = formData;
    if (
      schedules &&
      Array.isArray(schedules) &&
      schedules.length &&
      !schedules[0].cron
    ) {
      return [
        {
          path: ["schedules", "0", "cron"],
          message: i18nMark("CRON schedule is required.")
        }
      ];
    }
    return [];
  },

  scheduleIdIsValid(formData: JobOutput) {
    const { schedules } = formData;
    const idRegex = /^([a-z0-9][a-z0-9\\-]*[a-z0-9]+)$/;
    const message = i18nMark(
      "ID must be at least 2 characters and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash."
    );
    if (!schedules || !Array.isArray(schedules) || !schedules.length) {
      return [];
    }
    const schedule = schedules[0];
    if (schedule.id && typeof schedule.id !== "string") {
      return [
        {
          path: ["schedules", "0", "id"],
          message: i18nMark("Schedule ID must be a string.")
        }
      ];
    }
    return schedule && schedule.id && idRegex.test(schedule.id)
      ? []
      : [{ path: ["schedules", "0", "id"], message }];
  },

  scheduleStartingDeadlineIsValid(formData: JobOutput) {
    const { schedules } = formData;
    const errors = [];
    if (
      schedules &&
      Array.isArray(schedules) &&
      schedules.length &&
      schedules[0].startingDeadlineSeconds != undefined
    ) {
      if (typeof schedules[0].startingDeadlineSeconds !== "number") {
        errors.push({
          path: ["schedules", "0", "startingDeadlineSeconds"],
          message: i18nMark("Starting deadline must be a number.")
        });
      }
      if (schedules[0].startingDeadlineSeconds < 1) {
        errors.push({
          path: ["schedules", "0", "startingDeadlineSeconds"],
          message: i18nMark("Minimum value is 1.")
        });
      }
    }
    return errors;
  }
};

export function validateFormLabels(jobSpec: JobSpec): FormError[] {
  const labels = (jobSpec.job.labels || []).map(([k]) => k);
  const message = i18nMark("Cannot have multiple labels with the same key.");

  return pipe(
    allUniq(_ => "labels", [labels], message),
    isUniqIn(labels)(i => `labels.${i}`, labels, message)
  )([]);
}
