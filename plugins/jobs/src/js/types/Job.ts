import {
  JobDetailResponse as MetronomeJobDetailResponse,
  JobStatus as MetronomeJobStatus
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

export function JobTypeResolver(response: MetronomeJobDetailResponse): Job {
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
    jobRuns: JobFieldResolvers.jobRuns(response),
    lastRunsSummary: JobFieldResolvers.lastRunsSummary(response),
    scheduleStatus: JobFieldResolvers.scheduleStatus(response),
    activeRuns: JobFieldResolvers.activeRuns(response),
    schedules: JobFieldResolvers.schedules(response)
  };
}
export const JobFieldResolvers = {
  id(job: MetronomeJobDetailResponse): string {
    return job.id;
  },
  description(job: MetronomeJobDetailResponse): string {
    return job.description;
  },
  command(job: MetronomeJobDetailResponse): string {
    return job.run.cmd;
  },
  disk(job: MetronomeJobDetailResponse): number {
    return job.run.disk;
  },
  mem(job: MetronomeJobDetailResponse): number {
    return job.run.mem;
  },
  cpus(job: MetronomeJobDetailResponse): number {
    return job.run.cpus;
  },
  activeRuns(job: MetronomeJobDetailResponse): JobRunConnection {
    return JobRunConnectionTypeResolver(job.activeRuns);
  },
  docker(job: MetronomeJobDetailResponse): JobDocker | null {
    return job.run.docker ? JobDockerTypeResolver(job.run.docker) : null;
  },
  jobRuns(job: MetronomeJobDetailResponse): JobRunConnection {
    return AddStatusToHistoryJobRuns(job);
  },
  json(job: MetronomeJobDetailResponse): string {
    return JSON.stringify(cleanJobJSON(job));
  },
  labels(job: MetronomeJobDetailResponse): JobLabel[] {
    return Object.entries(job.labels).map(([key, value]) => ({ key, value }));
  },
  lastRunsSummary(job: MetronomeJobDetailResponse): JobHistorySummary {
    return JobHistorySummaryTypeResolver(job.history);
  },
  lastRunStatus(job: MetronomeJobDetailResponse): JobRunStatusSummary {
    return JobRunStatusSummaryTypeResolver(job);
  },
  name(job: MetronomeJobDetailResponse): string {
    return job.id.split(".").pop() || "";
  },
  schedules(job: MetronomeJobDetailResponse): JobScheduleConnection {
    return JobScheduleConnectionTypeResolver(job.schedules);
  },
  scheduleStatus(job: MetronomeJobDetailResponse): JobStatus {
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
  job: MetronomeJobDetailResponse
): JobRunConnection {
  const { successfulFinishedRuns, failedFinishedRuns } = job.history;

  const successfulFinishedRunsWithStatus: JobHistoryRun[] = successfulFinishedRuns.map(
    run => ({ ...run, status: "COMPLETED" as MetronomeJobStatus }) // TODO: investiagte why we need to cast this
  );

  const failedFinishedRunsWithStatus: JobHistoryRun[] = failedFinishedRuns.map(
    run => ({
      ...run,
      status: "FAILED" as MetronomeJobStatus
    })
  );

  return JobRunConnectionTypeResolver([
    ...job.activeRuns,
    ...successfulFinishedRunsWithStatus,
    ...failedFinishedRunsWithStatus
  ]);
}
