import {
  GenericJobResponse as MetronomeGenericJobResponse,
  JobResponse as MetronomeJobResponse,
  isDetailResponse as isMetronomeJobDetailResponse
} from "#SRC/js/events/MetronomeClient";
import {
  JobRunConnection,
  JobRunConnectionTypeResolver,
  JobRunConnectionSchema
} from "#PLUGINS/jobs/src/js/types/JobRunConnection";
import {
  JobHistorySummary,
  JobHistorySummaryTypeResolver,
  JobHistorySummarySchema
} from "#PLUGINS/jobs/src/js/types/JobHistorySummary";
import {
  JobRunStatusSummary,
  JobRunStatusSummaryTypeResolver,
  JobRunStatusSummarySchema
} from "#PLUGINS/jobs/src/js/types/JobRunStatusSummary";
import {
  JobScheduleConnection,
  JobScheduleConnectionTypeResolver,
  JobScheduleConnectionSchema
} from "#PLUGINS/jobs/src/js/types/JobScheduleConnection";
import {
  JobStatus,
  JobStatusSchema
} from "#PLUGINS/jobs/src/js/types/JobStatus";
import { JobHistoryRun } from "#PLUGINS/jobs/src/js/types/JobHistoryRun";
import {
  JobDockerTypeResolver,
  JobDocker,
  JobDockerSchema
} from "#PLUGINS/jobs/src/js/types/JobDocker";
import { JobLabel, LabelSchema } from "#PLUGINS/jobs/src/js/types/JobLabel";
import { cleanJobJSON } from "#SRC/js/utils/CleanJSONUtil";

export interface Job {
  activeRuns: JobRunConnection | null;
  command: string;
  cpus: number;
  description: string | null;
  disk: number;
  docker: JobDocker | null;
  id: string;
  jobRuns: JobRunConnection | null;
  json: string;
  labels: JobLabel[];
  lastRunsSummary: JobHistorySummary;
  lastRunStatus: JobRunStatusSummary;
  mem: number;
  name: string;
  path: string[];
  schedules: JobScheduleConnection;
  scheduleStatus: JobStatus;
}

export const JobSchema = `
${JobRunConnectionSchema}
${LabelSchema}
${JobHistorySummarySchema}
${JobRunStatusSummarySchema}
${JobStatusSchema}
${JobDockerSchema}
${JobScheduleConnectionSchema}

type Job {
  activeRuns: JobRunConnection
  command: String!
  cpus: Float!
  description: String
  disk: Float!
  docker: Docker
  id: ID!
  jobRuns: JobRunConnection
  json: String!
  labels: [Label]!
  lastRunsSummary: JobHistorySummary
  lastRunStatus: JobRunStatusSummary
  mem: Int!
  name: String!
  path: [String]!
  schedules: ScheduleConnection!
  scheduleStatus: JobStatus!
}
`;

export function JobTypeResolver(job: MetronomeGenericJobResponse): Job {
  return {
    activeRuns: isMetronomeJobDetailResponse(job)
      ? JobRunConnectionTypeResolver(job.activeRuns)
      : null,
    command: job.run.cmd,
    cpus: job.run.cpus,
    description: isMetronomeJobDetailResponse(job) ? job.description : null,
    disk: job.run.disk,
    docker:
      isMetronomeJobDetailResponse(job) && job.run.docker
        ? JobDockerTypeResolver(job.run.docker)
        : null,
    id: job.id,
    jobRuns: isMetronomeJobDetailResponse(job)
      ? AddStatusToHistoryJobRuns(job)
      : null,
    json: JSON.stringify(cleanJobJSON(job)),
    mem: job.run.mem,
    labels: Object.entries(job.labels).map(([key, value]) => ({ key, value })),
    lastRunStatus: isMetronomeJobDetailResponse(job)
      ? JobRunStatusSummaryTypeResolver(job.history)
      : JobRunStatusSummaryTypeResolver(
          (job as MetronomeJobResponse).historySummary
        ),
    lastRunsSummary: isMetronomeJobDetailResponse(job)
      ? JobHistorySummaryTypeResolver(job.history)
      : JobHistorySummaryTypeResolver(
          (job as MetronomeJobResponse).historySummary
        ),
    name: job.id.split(".").pop() || "",
    path: job.id.split(".").slice(0, -1),
    schedules: JobScheduleConnectionTypeResolver(job.schedules),
    scheduleStatus: scheduleStatus(job)
  };
}

const scheduleStatus = (job: MetronomeGenericJobResponse): JobStatus => {
  const scheduleConnection = JobScheduleConnectionTypeResolver(job.schedules);
  const jobRunConnection = AddStatusToHistoryJobRuns(job);

  if (jobRunConnection.longestRunningActiveRun !== null) {
    return jobRunConnection.longestRunningActiveRun.status;
  }

  if (
    scheduleConnection.nodes.length > 0 &&
    scheduleConnection.nodes[0] != null &&
    scheduleConnection.nodes[0].enabled
  ) {
    return "SCHEDULED";
  }

  if (scheduleConnection.nodes.length === 0) {
    return "UNSCHEDULED";
  }

  return "COMPLETED";
};

function AddStatusToHistoryJobRuns(
  job: MetronomeGenericJobResponse
): JobRunConnection {
  if (!isMetronomeJobDetailResponse(job)) {
    return JobRunConnectionTypeResolver(job.activeRuns || []);
  }

  return JobRunConnectionTypeResolver([
    ...job.history.successfulFinishedRuns.map(
      (run): JobHistoryRun => ({ ...run, status: "COMPLETED" })
    ),
    ...job.history.failedFinishedRuns.map(
      (run): JobHistoryRun => ({ ...run, status: "FAILED" })
    ),
    ...(job.activeRuns || [])
  ]);
}
