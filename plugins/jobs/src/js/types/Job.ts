import {
  GenericJobResponse as MetronomeGenericJobResponse,
  JobResponse as MetronomeJobResponse,
  JobStatus as MetronomeJobStatus,
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

export function JobTypeResolver(response: MetronomeGenericJobResponse): Job {
  return {
    id: JobFieldResolvers.id(response),
    description: JobFieldResolvers.description(response),
    command: JobFieldResolvers.command(response),
    disk: JobFieldResolvers.disk(response),
    mem: JobFieldResolvers.mem(response),
    cpus: JobFieldResolvers.cpus(response),
    docker: JobFieldResolvers.docker(response),
    json: JobFieldResolvers.json(response),
    labels: JobFieldResolvers.labels(response),
    lastRunStatus: JobFieldResolvers.lastRunStatus(response),
    name: JobFieldResolvers.name(response),
    path: JobFieldResolvers.path(response),
    jobRuns: JobFieldResolvers.jobRuns(response),
    lastRunsSummary: JobFieldResolvers.lastRunsSummary(response),
    scheduleStatus: JobFieldResolvers.scheduleStatus(response),
    activeRuns: JobFieldResolvers.activeRuns(response),
    schedules: JobFieldResolvers.schedules(response)
  };
}

export const JobFieldResolvers = {
  id(job: MetronomeGenericJobResponse): string {
    return job.id;
  },
  description(job: MetronomeGenericJobResponse): string | null {
    return isMetronomeJobDetailResponse(job) ? job.description : null;
  },
  command(job: MetronomeGenericJobResponse): string {
    return job.run.cmd;
  },
  disk(job: MetronomeGenericJobResponse): number {
    return job.run.disk;
  },
  mem(job: MetronomeGenericJobResponse): number {
    return job.run.mem;
  },
  cpus(job: MetronomeGenericJobResponse): number {
    return job.run.cpus;
  },
  activeRuns(job: MetronomeGenericJobResponse): JobRunConnection | null {
    return isMetronomeJobDetailResponse(job)
      ? JobRunConnectionTypeResolver(job.activeRuns)
      : null;
  },
  docker(job: MetronomeGenericJobResponse): JobDocker | null {
    if (isMetronomeJobDetailResponse(job) && job.run.docker) {
      return JobDockerTypeResolver(job.run.docker);
    }
    return null;
  },
  jobRuns(job: MetronomeGenericJobResponse): JobRunConnection | null {
    return isMetronomeJobDetailResponse(job)
      ? AddStatusToHistoryJobRuns(job)
      : null;
  },
  json(job: MetronomeGenericJobResponse): string {
    return JSON.stringify(cleanJobJSON(job));
  },
  labels(job: MetronomeGenericJobResponse): JobLabel[] {
    return Object.entries(job.labels).map(([key, value]) => ({ key, value }));
  },
  lastRunsSummary(job: MetronomeGenericJobResponse): JobHistorySummary {
    return isMetronomeJobDetailResponse(job)
      ? JobHistorySummaryTypeResolver(job.history)
      : JobHistorySummaryTypeResolver(
          (job as MetronomeJobResponse).historySummary
        );
  },
  lastRunStatus(job: MetronomeGenericJobResponse): JobRunStatusSummary {
    return isMetronomeJobDetailResponse(job)
      ? JobRunStatusSummaryTypeResolver(job.history)
      : JobRunStatusSummaryTypeResolver(
          (job as MetronomeJobResponse).historySummary
        );
  },
  name(job: MetronomeGenericJobResponse): string {
    return job.id.split(".").pop() || "";
  },
  path(job: MetronomeGenericJobResponse): string[] {
    return job.id.split(".").slice(0, -1);
  },
  schedules(job: MetronomeGenericJobResponse): JobScheduleConnection {
    return JobScheduleConnectionTypeResolver(job.schedules);
  },
  scheduleStatus(job: MetronomeGenericJobResponse): JobStatus {
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
  }
};

function AddStatusToHistoryJobRuns(
  job: MetronomeGenericJobResponse
): JobRunConnection {
  let successfulFinishedRunsWithStatus: JobHistoryRun[] = [];
  let failedFinishedRunsWithStatus: JobHistoryRun[] = [];
  const activeRuns = job.activeRuns || [];

  if (isMetronomeJobDetailResponse(job)) {
    const { successfulFinishedRuns, failedFinishedRuns } = job.history;

    successfulFinishedRunsWithStatus = successfulFinishedRuns.map(
      run => ({ ...run, status: "COMPLETED" as MetronomeJobStatus }) // TODO: investiagte why we need to cast this
    );

    failedFinishedRunsWithStatus = failedFinishedRuns.map(run => ({
      ...run,
      status: "FAILED" as MetronomeJobStatus
    }));
  }
  return JobRunConnectionTypeResolver([
    ...activeRuns,
    ...successfulFinishedRunsWithStatus,
    ...failedFinishedRunsWithStatus
  ]);
}
