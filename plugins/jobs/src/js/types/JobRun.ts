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

export function JobRunTypeResolver(
  run: MetronomeActiveJobRun | JobHistoryRun
): JobRun {
  return {
    jobID: JobRunFieldResolvers.jobID(run),
    dateCreated: JobRunFieldResolvers.dateCreated(run),
    dateFinished: JobRunFieldResolvers.dateFinished(run),
    status: JobRunFieldResolvers.status(run), // TODO: derive from where it comes from before passing to this function
    tasks: JobRunFieldResolvers.tasks(run)
  };
}

export const JobRunFieldResolvers = {
  dateCreated(run: MetronomeActiveJobRun | JobHistoryRun): number | null {
    return DateUtil.strToMs(run.createdAt);
  },
  dateFinished(run: MetronomeActiveJobRun | JobHistoryRun): number | null {
    if (isActiveJobRun(run)) {
      return run.completedAt ? DateUtil.strToMs(run.completedAt) : null;
    }

    return DateUtil.strToMs(run.finishedAt);
  },

  jobID(run: MetronomeActiveJobRun | JobHistoryRun): string {
    return run.id;
  },

  status(run: MetronomeActiveJobRun | JobHistoryRun): JobStatus {
    return run.status;
  },

  tasks(run: MetronomeActiveJobRun | JobHistoryRun): JobTaskConnection {
    return JobTaskConnectionTypeResolver(isActiveJobRun(run) ? run.tasks : []);
  }
};

export function isActiveJobRun(arg: any): arg is MetronomeActiveJobRun {
  return arg.jobId !== undefined;
}
