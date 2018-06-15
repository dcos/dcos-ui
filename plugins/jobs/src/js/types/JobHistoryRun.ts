import { JobStatus } from "plugins/jobs/src/js/types/JobStatus";

export interface JobHistoryRun {
  id: string;
  createdAt: string;
  finishedAt: string;
  status: JobStatus;
}
