import { JobFormUIData, UcrContainer, JobFormData } from "./JobFormData";

export const DefaultJob: JobFormData = {
  id: "",
  description: "",
  run: {
    cmd: "",
    cpus: 0.1,
    disk: 0,
    mem: 128
  }
};

export const DefaultJobFormData: JobFormUIData = {
  job: DefaultJob,
  cmdOnly: true
};

export const DefaultContainer: UcrContainer = {
  image: {
    id: "",
    kind: "docker"
  }
};
