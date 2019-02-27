import { deepCopy } from "#SRC/js/utils/Util";

import {
  JobOutput,
  JobSpec,
  FormOutput,
  Container,
  DockerParameter
} from "./JobFormData";

export function jobSpecToOutputParser(jobSpec: JobSpec): JobOutput {
  const jobSpecCopy = deepCopy(jobSpec);
  if (jobSpecCopy.job && jobSpecCopy.job.run) {
    if (jobSpecCopy.job.run.gpus === "") {
      delete jobSpecCopy.job.run.gpus;
    }
    if (jobSpecCopy.cmdOnly) {
      delete jobSpecCopy.job.run.docker;
      delete jobSpecCopy.job.run.ucr;
      delete jobSpecCopy.job.run.gpus;
      delete jobSpecCopy.job.run.args;
    } else if (jobSpecCopy.container) {
      if (jobSpecCopy.job.run.cmd === "") {
        // You are allowed to run a job with a container and no command, but
        // the API will return an error if `cmd` is in the object but does not have
        // a minimum length of one.
        delete jobSpecCopy.job.run.cmd;
      }
      const container = jobSpecCopy.job.run[jobSpecCopy.container];
      delete jobSpecCopy.job.run.docker;
      delete jobSpecCopy.job.run.ucr;
      jobSpecCopy.job.run[jobSpecCopy.container] = container;
      if (jobSpecCopy.container !== Container.UCR) {
        delete jobSpecCopy.job.run.gpus;
      }
      if (jobSpecCopy.container !== Container.Docker) {
        delete jobSpecCopy.job.run.args;
      }
      if (jobSpecCopy.container === Container.Docker) {
        if (jobSpecCopy.job.run.docker.parameters) {
          const filteredParams = Array.isArray(
            jobSpecCopy.job.run.docker.parameters
          )
            ? jobSpecCopy.job.run.docker.parameters.filter(
                (param: DockerParameter) => param.key || param.value
              )
            : [];
          if (filteredParams.length) {
            jobSpecCopy.job.run.docker.parameters = filteredParams;
          } else {
            delete jobSpecCopy.job.run.docker.parameters;
          }
        }
        if (jobSpecCopy.job.run.args) {
          const filteredArgs = Array.isArray(jobSpecCopy.job.run.args)
            ? jobSpecCopy.job.run.args.filter((arg: string) => !!arg)
            : [];
          if (filteredArgs.length) {
            jobSpecCopy.job.run.args = filteredArgs;
          } else {
            delete jobSpecCopy.job.run.args;
          }
        }
      }
    }
  }
  const jobOutput = {
    job: jobSpecCopy.job,
    schedule: jobSpecCopy.schedule
  };

  return jobOutput;
}

export const jobSpecToFormOutputParser = (jobSpec: JobSpec): FormOutput => {
  const container = jobSpec.container;
  const containerImage =
    container === Container.UCR
      ? jobSpec.job.run.ucr &&
        jobSpec.job.run.ucr.image &&
        jobSpec.job.run.ucr.image.id
      : jobSpec.job.run.docker && jobSpec.job.run.docker.image;
  const dockerParameters =
    jobSpec.job.run.docker &&
    Array.isArray(jobSpec.job.run.docker.parameters) &&
    jobSpec.job.run.docker.parameters.length > 0
      ? jobSpec.job.run.docker.parameters
      : [];
  const args =
    Array.isArray(jobSpec.job.run.args) && jobSpec.job.run.args.length > 0
      ? jobSpec.job.run.args
      : [];
  const imageForcePull =
    container === Container.UCR
      ? jobSpec.job.run.ucr &&
        jobSpec.job.run.ucr.image &&
        jobSpec.job.run.ucr.image.forcePull
      : jobSpec.job.run.docker && jobSpec.job.run.docker.forcePullImage;
  const grantRuntimePrivileges =
    container === Container.Docker &&
    jobSpec.job.run.docker &&
    jobSpec.job.run.docker.privileged;

  return {
    jobId: jobSpec.job.id,
    description: jobSpec.job.description,
    cmdOnly: jobSpec.cmdOnly,
    container,
    cmd: jobSpec.job.run.cmd,
    containerImage,
    imageForcePull,
    grantRuntimePrivileges,
    cpus: jobSpec.job.run.cpus,
    gpus: jobSpec.job.run.gpus,
    mem: jobSpec.job.run.mem,
    disk: jobSpec.job.run.disk,
    dockerParams: dockerParameters,
    args
  };
};
