import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs";

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
  dateFinished: number;
  jobID: string;
  status: JobRunStatusSummary;
  tasks: JobTaskConnection;
}

export interface JobRunStatusSummary {
  status: JobRunStatus | null;
  time: number | null;
}

export type JobRunStatus = "FAILED" | "NOT_AVAILABLE" | "SUCCESS";

export interface JobTaskConnection {
  longestRunningTask: JobTask;
  nodes: JobTask[];
}

export interface JobTask {
  dateCompleted: number;
  dateStarted: number;
  status: JobTaskStatus;
  taskId: string;
}

export type JobTaskStatus =
  | "TASK_CREATED"
  | "TASK_DROPPED"
  | "TASK_ERROR"
  | "TASK_FAILED"
  | "TASK_FINISHED"
  | "TASK_GONE"
  | "TASK_GONE_BY_OPERATOR"
  | "TASK_KILLED"
  | "TASK_KILLING"
  | "TASK_LOST"
  | "TASK_RUNNING"
  | "TASK_STAGING"
  | "TASK_STARTED"
  | "TASK_STARTING"
  | "TASK_UNKNOWN"
  | "TASK_UNREACHABLE";

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
  | "ACTIVE"
  | "COMPLETED"
  | "FAILED"
  | "INITIAL"
  | "RUNNING"
  | "SCHEDULED"
  | "STARTING"
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
  dateFinished: Int!
  jobID: String!
  status: JobRunStatusSummary!
  tasks: JobTaskConnection!
}
type JobTaskConnection {
  longestRunningTask: JobTask!
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

// Pass implementation of MetronomeClient to the resolvers for easier testability
export const resolvers = (): IResolvers => ({
  Query: {
    jobs(
      _obj = {},
      _args: GeneralArgs = {},
      _context = {}
    ): Observable<JobConnection | null> {
      return Observable.of(null);
    },
    job(_obj = {}, _args: GeneralArgs, _context = {}): Observable<Job | null> {
      return Observable.of(null);
    }
  }
});

export default makeExecutableSchema({
  typeDefs,
  resolvers: resolvers()
});
