import * as MetronomeClient from "#SRC/js/events/MetronomeClient";
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
import JobRunList from "#SRC/js/structs/JobRunList";
import {
  JobDockerTypeResolver,
  JobDocker,
  JobDockerSchema
} from "#PLUGINS/jobs/src/js/types/JobDocker";
import { JobLabel, LabelSchema } from "#PLUGINS/jobs/src/js/types/JobLabel";
import { cleanJobJSON } from "#SRC/js/utils/CleanJSONUtil";
import status from "plugins/jobs/src/js/constants/JobStatus";
import { JobConnection } from "plugins/jobs/src/js/types/JobConnection";
export interface Job {
  activeRuns: JobRunConnection;
  command: string;
  cpus: number;
  description: string;
  disk: number;
  docker: JobDocker | null;
  id: string;
  jobRuns: JobRunConnection;
  json: string;
  labels: JobLabel[];
  lastRunsSummary: JobHistorySummary;
  lastRunStatus: JobRunStatusSummary;
  mem: number;
  name: string;
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
  activeRuns: JobRunConnection!
  command: String!
  cpus: Float!
  description: String!
  disk: Float!
  docker: Docker
  id: ID!
  jobRuns: JobRunConnection!
  json: String!
  labels: [Label]!
  lastRunsSummary: JobHistorySummary!
  lastRunStatus: JobRunStatusSummary!
  mem: Int!
  name: String!
  schedules: ScheduleConnection!
  scheduleStatus: JobStatus!
}
`;

export function JobTypeResolver(
  response: MetronomeClient.JobDetailResponse
): Job {
  return {
    id: fieldResolvers.id(response),
    description: fieldResolvers.description(response),
    command: fieldResolvers.command(response),
    disk: fieldResolvers.disk(response),
    mem: fieldResolvers.mem(response),
    cpus: fieldResolvers.cpus(response),
    docker: fieldResolvers.docker(response),
    json: fieldResolvers.json(response),
    labels: fieldResolvers.labels(response),
    lastRunStatus: fieldResolvers.lastRunStatus(response),
    name: fieldResolvers.name(response),
    jobRuns: fieldResolvers.jobRuns(response),
    lastRunsSummary: fieldResolvers.lastRunsSummary(response),
    scheduleStatus: fieldResolvers.scheduleStatus(response),
    activeRuns: fieldResolvers.activeRuns(response),
    schedules: fieldResolvers.schedules(response)
  };
}
export const fieldResolvers = {
  id(job: MetronomeClient.JobDetailResponse): string {
    return job.id;
  },
  description(job: MetronomeClient.JobDetailResponse): string {
    return job.description;
  },
  command(job: MetronomeClient.JobDetailResponse): string {
    return job.run.cmd;
  },
  disk(job: MetronomeClient.JobDetailResponse): number {
    return job.run.disk;
  },
  mem(job: MetronomeClient.JobDetailResponse): number {
    return job.run.mem;
  },
  cpus(job: MetronomeClient.JobDetailResponse): number {
    return job.run.cpus;
  },
  activeRuns(job: MetronomeClient.JobDetailResponse): JobRunConnection {
    return JobRunConnectionTypeResolver(job.activeRuns);
  },
  docker(job: MetronomeClient.JobDetailResponse): JobDocker | null {
    return job.run.docker ? JobDockerTypeResolver(job.run.docker) : null;
  },
  jobRuns(job: MetronomeClient.JobDetailResponse): JobRunConnection {
    return AddStatusToHistoryJobRuns(job);
  },
  json(job: MetronomeClient.JobDetailResponse): string {
    return JSON.stringify(cleanJobJSON(job));
  },
  labels(job: MetronomeClient.JobDetailResponse): JobLabel[] {
    return Object.entries(job.labels).map(([key, value]) => ({ key, value }));
  },
  lastRunsSummary(job: MetronomeClient.JobDetailResponse): JobHistorySummary {
    return JobHistorySummaryTypeResolver(job.history);
  },
  lastRunStatus(job: MetronomeClient.JobDetailResponse): JobRunStatusSummary {
    return JobRunStatusSummaryTypeResolver(job);
  },
  name(job: MetronomeClient.JobDetailResponse): string {
    return job.id.split(".").pop() || "";
  },
  schedules(job: MetronomeClient.JobDetailResponse): JobScheduleConnection {
    return JobScheduleConnectionTypeResolver(job.schedules);
  },
  scheduleStatus(job: MetronomeClient.JobDetailResponse): JobStatus {
    const jobRunConnection = AddStatusToHistoryJobRuns(job);

    if (jobRunConnection.longestRunningActiveRun !== null) {
      return jobRunConnection.longestRunningActiveRun.status;
    }

    const scheduleConnection = JobScheduleConnectionTypeResolver(job.schedules);

    if (jobRunConnection.nodes.length > 0) {
      const schedule = scheduleConnection.nodes[0];

      if (schedule != null && schedule.enabled) {
        return "SCHEDULED";
      }
    }

    if (
      scheduleConnection.nodes.length === 0 &&
      JobRunConnectionTypeResolver(job.activeRuns).nodes.length === 0
    ) {
      return "UNSCHEDULED";
    }

    return "COMPLETED";
  }
};

function AddStatusToHistoryJobRuns(
  job: MetronomeClient.JobDetailResponse
): JobRunConnection {
  const { successfulFinishedRuns, failedFinishedRuns } = job.history;

  const successfulFinishedRunsWithStatus: JobHistoryRun[] = successfulFinishedRuns.map(
    run => ({ ...run, status: "COMPLETED" as MetronomeClient.JobStatus }) // TODO: investiagte why we need to cast this
  );

  const failedFinishedRunsWithStatus: JobHistoryRun[] = failedFinishedRuns.map(
    run => ({
      ...run,
      status: "FAILED" as MetronomeClient.JobStatus
    })
  );

  return JobRunConnectionTypeResolver([
    ...job.activeRuns,
    ...successfulFinishedRunsWithStatus,
    ...failedFinishedRunsWithStatus
  ]);
}
