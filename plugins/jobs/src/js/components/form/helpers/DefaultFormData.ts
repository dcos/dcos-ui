import {
  UcrContainer,
  JobSpecData,
  DockerContainer,
  JobSpec,
  Container,
  UcrImageKind
} from "./JobFormData";

export const JobDataPlaceholders = {
  maxLaunchDelay: 3600,
  timezone: "UTC",
  startingDeadlineSeconds: 900
};

export const getDefaultJob = (): JobSpecData => ({
  id: "",
  description: "",
  run: {
    cmd: "",
    cpus: 1.0,
    disk: 0,
    mem: 128,
    docker: getDefaultDocker(),
    ucr: getDefaultContainer()
  }
});

export const getDefaultJobSpec = (): JobSpec => ({
  job: getDefaultJob(),
  cmdOnly: false,
  container: Container.UCR
});

export const getDefaultContainer = (): UcrContainer => ({
  image: {
    id: "",
    kind: UcrImageKind.Docker
  }
});

export const getDefaultDocker = (): DockerContainer => ({
  image: ""
});
