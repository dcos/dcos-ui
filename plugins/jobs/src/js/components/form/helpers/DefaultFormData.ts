import {
  UcrContainer,
  JobFormData,
  DockerContainer,
  JobSpec,
  Container,
  UcrImageKind
} from "./JobFormData";

export const getDefaultJob = (): JobFormData => ({
  id: "",
  description: "",
  run: {
    cmd: "",
    cpus: 0.1,
    disk: 0,
    mem: 128,
    gpus: 0,
    docker: getDefaultDocker(),
    ucr: getDefaultContainer()
  }
});

export const getDefaultJobSpec = (): JobSpec => ({
  job: getDefaultJob(),
  cmdOnly: true,
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
