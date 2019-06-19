import {
  JobTaskConnection,
  JobTaskConnectionTypeResolver,
  JobTaskConnectionSchema
} from "#PLUGINS/jobs/src/js/types/JobTaskConnection";
import { ActiveJobRun as MetronomeActiveJobRun } from "#SRC/js/events/MetronomeClient";
import { JobStatus } from "#PLUGINS/jobs/src/js/types/JobStatus";
import DateUtil from "#SRC/js/utils/DateUtil";
import { JobRunStatusSchema } from "#PLUGINS/jobs/src/js/types/JobRunStatus";
import { JobHistoryRun } from "#PLUGINS/jobs/src/js/types/JobHistoryRun";

export interface JobRun {
  dateCreated: number | null;
  dateFinished: number | null;
  jobID: string;
  status: JobStatus;
  tasks: JobTaskConnection;
}

export const JobRunSchema = `
${JobRunStatusSchema}
${JobTaskConnectionSchema}
type JobRun {
  dateCreated: Int!
  dateFinished: Int
  jobID: String!
  status: JobRunStatus!
  tasks: JobTaskConnection!
}
`;

type Run = MetronomeActiveJobRun | JobHistoryRun;

export const JobRunTypeResolver = (run: Run): JobRun => ({
  jobID: run.id,
  dateCreated: DateUtil.strToMs(run.createdAt),
  dateFinished: dateFinished(run),
  status: run.status,
  tasks: JobTaskConnectionTypeResolver(isActiveJobRun(run) ? run.tasks : [])
});

function dateFinished(run: Run) {
  if (isActiveJobRun(run)) {
    return run.completedAt ? DateUtil.strToMs(run.completedAt) : null;
  }
  return DateUtil.strToMs(run.finishedAt);
}

export const isActiveJobRun = (arg: Run): arg is MetronomeActiveJobRun =>
  (arg as any).jobId !== undefined;
