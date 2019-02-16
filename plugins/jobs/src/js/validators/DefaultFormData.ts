import { JobFormUIData, UcrContainer, JobFormData } from "./JobFormData";

export const getDefaultJob = (): JobFormData => ({
  id: "",
  description: "",
  run: {
    cmd: "",
    cpus: 0.1,
    disk: 0,
    mem: 128
  }
});

export const getDefaultJobFormData = (): JobFormUIData => ({
  job: getDefaultJob(),
  cmdOnly: true
});

export const getDefaultContainer = (): UcrContainer => ({
  image: {
    id: "",
    kind: "docker"
  }
});
