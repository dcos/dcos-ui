import { JobStatus } from "plugins/jobs/src/js/types/JobStatus";
import { JobRunTask } from "src/js/events/MetronomeClient";

export type HistoricJobRun = {
  id: string;
  createdAt: string;
  finishedAt: string;
  status: JobStatus;
  tasks: JobRunTask[];
};
