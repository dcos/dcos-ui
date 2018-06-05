import { Observable } from "rxjs";
import { makeExecutableSchema } from "graphql-tools";

import JobStates from "../../constants/JobStates";
import JobStatus from "../../constants/JobStatus";

interface ISchedule {
  concurrencyPolicy: string;
  cron: string;
  enabled: boolean;
  id: string;
  nextRunAt: string;
  startingDeadlineSeconds: number;
  timezone: string;
}

interface IJobResponse {
  id: string;
  labels?: object;
  run: {
    cpus: number;
    mem: number;
    disk: number;
    cmd: string;
    env: object;
    placement: {
      constraints: any[];
    };
    artifacts: any[];
  };
  schedules: ISchedule[];
  historySummary: {
    failureCount: number;
    lastFailureAt: string;
    lastSuccessAt: string;
    successCount: number;
  };
}

interface IJobsArg {
  filter?: string;
  sortBy?: "id" | "status" | "lastRun";
  sortDirection?: "ASC" | "DESC";
}

export const typeDefs = `
  type JobRunSummary {
    lastFailureAt: String
    lastSuccessAt: String
    status: JobRunStatus
  }

  type Job {
    id: ID!
    name: String!
    status: JobStatus!
    lastRun: JobRunSummary!
  }

  enum JobRunStatus {
    NOT_AVAILABLE
    SUCCESS
    FAILED
  }

  enum JobStatus {
    RUNNING
    COMPLETED
    SCHEDULED
    UNSCHEDULED
    FAILED
    ACTIVE
    STARTING
    INITIAL
  }

  type Namespace {
    id: ID!
    items: MetronomeItem
  }

  union MetronomeItem = Job | Namespace

  type SearchCount {
    all: Int!
    filtered: Int!
  }

  type MetronomeResult {
    count: SearchCount!
    items: [MetronomeItem]!
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
    metronomeItems(filter: String, sortBy: SortOption, sortDirection: SortDirection): MetronomeResult
    metronomeItem(id: ID!, filter: String, sortBy: SortOption, sortDirection: SortDirection): MetronomeResult
  }
`;

function isNamespace(job: IJobResponse): boolean {
  return job.id.split(".").length > 1;
}

function sortJobById(a: IJobResponse, b: IJobResponse): number {
  return a.id.localeCompare(b.id);
}

function sortJobByStatus(a: IJobResponse, b: IJobResponse): number {
  return JobStates[a.status].sortOrder - JobStates[b.status].sortOrder;
}

function sortJobByLastRun(a: IJobResponse, b: IJobResponse): number {
  return (
    JobStatus[a.lastRun.status].sortOrder -
    JobStatus[b.lastRun.status].sortOrder
  );
}

export const resolvers = ({
  fetchJobs,
  pollingInterval
}: {
  fetchJobs: () => IJobResponse[];
  pollingInterval: number;
}) => ({
  Query: {
    metronomeItems(obj = {}, args: IJobsArg = {}, context = {}) {
      const { sortBy = "id", sortDirection = "ASC", filter } = args;
      const pollingInterval$ = Observable.interval(pollingInterval);
      const responses$ = pollingInterval$.switchMap(fetchJobs);

      const filteredResponses$ = !filter
        ? responses$
        : responses$.map(jobs =>
            jobs.filter(({ id }) => id.indexOf(filter) !== -1)
          );

      // TODO: data mangling
      // .map(response => ({ ...response, struct: new Job(response) }))
      // .map(response => ({
      //   id: response.id,
      //   lastRun: {
      //     status: response.struct.getLastRunStatus().status,
      //     lastSuccessAt: response.historySummary.lastSuccessAt,
      //     lastFailureAt: response.historySummary.lastFailureAt
      //   },
      //   name: response.struct.getName(),
      //   schedules: response.struct.getSchedules(),
      //   status: response.struct.getScheduleStatus()
      // }));

      return filteredResponses$.map(jobs =>
        jobs.sort((a, b) => {
          const direction = sortDirection === "ASC" ? 1 : -1;
          const isANamespace = isNamespace(a);
          const isBNamespace = isNamespace(b);

          if (isANamespace && !isBNamespace) {
            return -1;
          }

          if (!isANamespace && isBNamespace) {
            return 1;
          }

          let result = 0;

          switch (sortBy) {
            case "id":
              result = sortJobById(a, b);
              break;
            case "status":
              result = sortJobByStatus(a, b);
              break;
            case "lastRun":
              result = sortJobByLastRun(a, b);
              break;
          }

          return result * direction;
        })
      );
    },
    metronomeItem(obj = {}, args = {}, context = {}) {
      return Observable.of({});
    }
  }
});

export const defaultSchema = makeExecutableSchema({
  typeDefs,
  resolvers: {} // TODO: fill with real interval and API
});
