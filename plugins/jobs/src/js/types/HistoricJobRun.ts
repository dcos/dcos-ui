import { JobStatus } from "plugins/jobs/src/js/types/JobStatus";

export type HistoricJobRun = {
  id: string;
  createdAt: string;
  finishedAt: string;
  status: JobStatus;
  tasks?: string[];
};
