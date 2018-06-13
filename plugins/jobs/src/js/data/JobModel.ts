import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs";
// TODO: remove this disable with https://jira.mesosphere.com/browse/DCOS_OSS-3579
// tslint:disable-next-line:no-submodule-imports
import * as MetronomeClient from "#SRC/js/events/MetronomeClient";
// tslint:disable-next-line:no-submodule-imports
import JobRunList from "#SRC/js/structs/JobRunList";
// tslint:disable-next-line:no-submodule-imports
import DateUtil from "#SRC/js/utils/DateUtil";

export interface Query {
  jobs: JobConnection | null;
  job: Job | null;
}

export interface GeneralArgs {
  [key: string]: any;
}

export interface JobsQueryArgs {
  filter?: string | null;
  sortBy?: SortOption | null;
  sortDirection?: SortDirection | null;
}

export interface JobQueryArgs {
  id: string;
  filter?: string | null;
  sortBy?: SortOption | null;
  sortDirection?: SortDirection | null;
}

export type SortOption = "ID" | "STATUS" | "LAST_RUN";

export type SortDirection = "ASC" | "DESC";

export interface JobConnection {
  filteredCount: number;
  totalCount: number;
  nodes: Job[];
}

export interface Job {
  activeRuns: JobRunConnection;
  command: string;
  cpus: number;
  description: string;
  disk: number;
  docker: Docker | null;
  id: string;
  jobRuns: JobRunConnection;
  json: string;
  labels: Label[];
  lastRunsSummary: JobHistorySummary;
  lastRunStatus: JobRunStatusSummary;
  mem: number;
  name: string;
  schedules: ScheduleConnection;
  scheduleStatus: JobStatus;
}

export interface JobRunConnection {
  longestRunningActiveRun: JobRun | null;
  nodes: JobRun[];
}

export interface JobRun {
  dateCreated: number;
  dateFinished: number | null;
  jobID: string;
  status: MetronomeClient.JobStatus;
  tasks: JobTaskConnection;
}

export interface JobRunStatusSummary {
  status: MetronomeClient.JobStatus | null;
  time: number | null;
}

export interface JobTaskConnection {
  longestRunningTask: JobTask | null;
  nodes: JobTask[];
}

export interface JobTask {
  dateCompleted: number | null;
  dateStarted: number;
  status: MetronomeClient.JobTaskStatus;
  taskId: string;
}

export interface Docker {
  forcePullImage: boolean;
  image: string;
}

export interface Label {
  key: string;
  value: string;
}

export interface JobHistorySummary {
  failureCount: number;
  lastFailureAt: string | null;
  lastSuccessAt: string | null;
  successCount: number;
}

export interface ScheduleConnection {
  nodes: Schedule[];
}

export interface Schedule {
  cron: string;
  enabled: boolean;
  id: string;
  startingDeadlineSeconds: number;
  timezone: string;
}

export type JobStatus =
  | MetronomeClient.JobStatus
  | "COMPLETED"
  | "SCHEDULED"
  | "UNSCHEDULED";

export const typeDefs = `
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
type JobRunConnection {
  longestRunningActiveRun: JobRun
  nodes: [JobRun]!
}
type JobRun {
  dateCreated: Int!
  dateFinished: Int
  jobID: String!
  status: JobRunStatus!
  tasks: JobTaskConnection!
}
type JobTaskConnection {
  longestRunningTask: JobTask
  nodes: [JobTask]!
}
type JobTask {
  dateCompleted: Int!
  dateStarted: Int!
  status: JobTaskStatus!
  taskId: String!
}
type JobHistorySummary {
  failureCount: Int!
  lastFailureAt: String
  lastSuccessAt: String
  successCount: Int!
}
type Docker {
  forcePullImage: Boolean!
  image: String!
}
type Label {
  key: String!
  value: String!
}
type JobRunStatusSummary {
  status: JobRunStatus
  time: Int
}
type ScheduleConnection {
  nodes: [Schedule]!
}
type Schedule {
  cron: String!
  enabled: Boolean!
  id: ID!
  startingDeadlineSeconds: Int!
  timezone: String!
}
enum JobTaskStatus {
  TASK_CREATED
  TASK_DROPPED
  TASK_ERROR
  TASK_FAILED
  TASK_FINISHED
  TASK_GONE
  TASK_GONE_BY_OPERATOR
  TASK_KILLED
  TASK_KILLING
  TASK_LOST
  TASK_RUNNING
  TASK_STAGING
  TASK_STARTED
  TASK_STARTING
  TASK_UNKNOWN
  TASK_UNREACHABLE
}
enum JobRunStatus {
  FAILED
  NOT_AVAILABLE
  SUCCESS
}
enum JobStatus {
  ACTIVE
  COMPLETED
  FAILED
  INITIAL
  RUNNING
  SCHEDULED
  STARTING
  UNSCHEDULED
}
type JobConnection {
  filteredCount: Int!
  totalCount: Int!
  nodes: [Job]!
}
enum SortOption {
  ID
  STATUS
  LAST_RUN
}
enum SortDirection {
  ASC
  DESC
}
type Query {
  jobs(
    filter: String
    sortBy: SortOption
    sortDirection: SortDirection
  ): JobConnection
  job(
    id: ID!
    filter: String
    sortBy: SortOption
    sortDirection: SortDirection
  ): Job
}
`;

interface ResolverArgs {
  fetchJobDetail: (id: string) => Observable<MetronomeClient.JobDetailResponse>;
  pollingInterval: number;
}

function isActiveRun(arg: any): arg is MetronomeClient.ActiveJobRun {
  return arg.jobId !== undefined;
}

function isHistoryRun(arg: any): arg is MetronomeClient.JobHistoryRun {
  return arg.id !== undefined;
}

const typeResolvers = {
  Job(response: MetronomeClient.JobDetailResponse): Job {
    return {
      id: response.id,
      description: response.description,
      command: response.run.cmd,
      disk: response.run.disk,
      mem: response.run.mem,
      cpus: response.run.cpus,
      name: fieldResolvers.Job.name(response),
      jobRuns: fieldResolvers.Job.jobRuns(response),
      scheduleStatus: fieldResolvers.Job.scheduleStatus(response),
      activeRuns: typeResolvers.JobRunConnection(response.activeRuns),
      schedules: fieldResolvers.Job.schedules(response)
    };
  },
  JobRun(run: MetronomeClient.ActiveJobRun | JobHistoryRunWithStatus): JobRun {
    return {
      jobID: fieldResolvers.JobRun.jobID(run),
      dateCreated: DateUtil.strToMs(run.createdAt),
      dateFinished: fieldResolvers.JobRun.dateFinished(run),
      status: run.status, // TODO: derive from where it comes from before passing to this function
      tasks: fieldResolvers.JobRun.tasks(run)
    };
  },
  JobRunConnection(
    runs: Array<MetronomeClient.ActiveJobRun | JobHistoryRunWithStatus>
  ): JobRunConnection {
    return {
      longestRunningActiveRun: fieldResolvers.JobRunConnection.longestRunningActiveRun(
        runs
      ),
      nodes: runs.map(run => typeResolvers.JobRun(run))
    };
  },
  JobTask(task: MetronomeClient.JobRunTasks): JobTask {
    return {
      dateStarted: DateUtil.strToMs(task.createdAt),
      dateCompleted: task.finishedAt ? DateUtil.strToMs(task.finishedAt) : null,
      status: task.status,
      taskId: task.id
    };
  },
  JobTaskConnection(tasks: MetronomeClient.JobRunTasks[]): JobTaskConnection {
    const parsedTasks = (tasks || []).map(task => typeResolvers.JobTask(task));
    return {
      longestRunningTask: fieldResolvers.JobTaskConnection.longestRunningTask(
        parsedTasks
      ),
      nodes: parsedTasks
    };
  },
  Schedule(schedule: MetronomeClient.Schedule): Schedule {
    return {
      cron: schedule.cron,
      enabled: schedule.enabled,
      id: schedule.id,
      startingDeadlineSeconds: schedule.startingDeadlineSeconds,
      timezone: schedule.timezone
    };
  }
};

interface JobHistoryRunWithStatus extends MetronomeClient.JobHistoryRun {
  status: MetronomeClient.JobStatus;
}

// We currently don't support field resolvers directly, so we need to
// call these manually.
const fieldResolvers = {
  Job: {
    activeRuns(job: MetronomeClient.JobDetailResponse): JobRunConnection {
      return typeResolvers.JobRunConnection(job.activeRuns);
    },
    jobRuns(job: MetronomeClient.JobDetailResponse): JobRunConnection {
      const { successfulFinishedRuns, failedFinishedRuns } = job.history;

      const successfulFinishedRunsWithStatus: JobHistoryRunWithStatus[] = successfulFinishedRuns.map(
        run => ({ ...run, status: "COMPLETED" as MetronomeClient.JobStatus }) // TODO: investiagte why we need to cast this
      );

      const failedFinishedRunsWithStatus: JobHistoryRunWithStatus[] = failedFinishedRuns.map(
        run => ({
          ...run,
          status: "FAILED" as MetronomeClient.JobStatus
        })
      );

      return typeResolvers.JobRunConnection([
        ...job.activeRuns,
        ...successfulFinishedRunsWithStatus,
        ...failedFinishedRunsWithStatus
      ]);
    },
    name(job: MetronomeClient.JobDetailResponse) {
      return job.id.split(".").pop();
    },
    schedules(job: MetronomeClient.JobDetailResponse): Schedule[] {
      return job.schedules.map(typeResolvers.Schedule);
    },
    scheduleStatus(job: MetronomeClient.JobDetailResponse): JobStatus {
      const activeRuns = new JobRunList({ items: job.activeRuns });
      const activeRunsLength = activeRuns.getItems().length;
      const scheduleLength = job.schedules.length;

      if (activeRunsLength > 0) {
        const longestRunningActiveRun = activeRuns.getLongestRunningActiveRun();

        return longestRunningActiveRun.status;
      }

      if (scheduleLength > 0) {
        const schedule = job.schedules[0];

        if (schedule != null && schedule.enabled) {
          return "SCHEDULED";
        }
      }

      if (scheduleLength === 0 && activeRunsLength === 0) {
        return "UNSCHEDULED";
      }

      return "COMPLETED";
    }
  },
  JobRun: {
    jobID(
      run: MetronomeClient.ActiveJobRun | MetronomeClient.JobHistoryRun
    ): string {
      if (isActiveRun(run)) {
        return run.jobId;
      }

      if (isHistoryRun(run)) {
        return run.id;
      }

      // Only for typescript, should be impossible
      return "";
    },
    dateFinished(
      run: MetronomeClient.ActiveJobRun | MetronomeClient.JobHistoryRun
    ): number | null {
      if (isActiveRun(run) && run.completedAt) {
        return DateUtil.strToMs(run.completedAt);
      }
      return null;
    },
    tasks(
      run: MetronomeClient.ActiveJobRun | MetronomeClient.JobHistoryRun
    ): JobTaskConnection {
      return typeResolvers.JobTaskConnection(isActiveRun(run) ? run.tasks : []);
    }
  },
  JobRunConnection: {
    longestRunningActiveRun(
      runs: Array<MetronomeClient.ActiveJobRun | JobHistoryRunWithStatus>
    ): JobRun | null {
      if (!runs.length) {
        return null;
      }

      const sortedRuns = runs.sort((a, b) => {
        if (a.createdAt == null && b.createdAt == null) {
          return 0;
        }

        if (a.createdAt == null) {
          return 1;
        }

        if (b.createdAt == null) {
          return -1;
        }

        return DateUtil.strToMs(a.createdAt) - DateUtil.strToMs(b.createdAt);
      });

      return typeResolvers.JobRun(sortedRuns[0]);
    }
  },
  JobTaskConnection: {
    longestRunningTask(tasks: JobTask[]): JobTask | null {
      if (!tasks.length) {
        return null;
      }

      const sortedTasks = [...tasks].sort((a, b) => {
        if (a.dateStarted == null && b.dateStarted == null) {
          return 0;
        }

        if (a.dateStarted == null) {
          return 1;
        }

        if (b.dateStarted == null) {
          return -1;
        }

        return a.dateStarted - b.dateStarted;
      });

      return sortedTasks[0];
    }
  }
};

export const resolvers = ({
  fetchJobDetail,
  pollingInterval
}: ResolverArgs): IResolvers => ({
  Query: {
    jobs(
      _obj = {},
      _args: GeneralArgs = {},
      _context = {}
    ): Observable<JobConnection | null> {
      return Observable.of(null);
    },
    job(_obj = {}, args: GeneralArgs, _context = {}): Observable<Job | null> {
      // TODO: Write typeguard here
      const { id } = args as JobQueryArgs;
      const pollingInterval$ = Observable.timer(0, pollingInterval);
      const responses$ = pollingInterval$.switchMap(() => fetchJobDetail(id));

      return responses$.map(response => typeResolvers.Job(response));
    }
  }
});

export default makeExecutableSchema({
  typeDefs,
  resolvers: resolvers({
    fetchJobDetail: MetronomeClient.fetchJobDetail,
    pollingInterval: 0
  })
});
