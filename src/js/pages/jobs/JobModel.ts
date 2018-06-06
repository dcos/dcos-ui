import { makeExecutableSchema } from "graphql-tools";
import { Observable } from "rxjs";
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
		name: String!
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

interface IJobResponseWithStatus extends IJobResponse {
  status: string;
  lastRun: {
    status: string;
  };
}

function sortJobByStatus(
  a: IJobResponseWithStatus,
  b: IJobResponseWithStatus
): number {
  return JobStates[a.status].sortOrder - JobStates[b.status].sortOrder;
}

function sortJobByLastRun(
  a: IJobResponseWithStatus,
  b: IJobResponseWithStatus
): number {
  return (
    JobStatus[a.lastRun.status].sortOrder -
    JobStatus[b.lastRun.status].sortOrder
  );
}

function response2Namespace(response: IJobResponse) {
  return {
    id: "ns-" + response.id.split(".")[0],
    name: response.id.split(".")[0],
    response,
    items: []
  };
}
function response2Job(response: IJobResponse) {
  return {
    id: "j-" + response.id,
    name: response.id,
    status: "TBD",
    lastrun: "TBD"
  };
}

export const resolvers = ({
  fetchJobs,
  pollingInterval
}: {
  fetchJobs: () => Observable<IJobResponse[]>;
  pollingInterval: number;
}) => ({
  MetronomeItem: {
    __resolverType(obj: IJobResponse, _args: IJobsArg = {}, _context = {}) {
      return isNamespace(obj) ? "Namespace" : "Job";
    }
  },
  Query: {
    metronomeItems(_obj = {}, args: IJobsArg = {}, _context = {}) {
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

      return filteredResponses$
        .map(jobs =>
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
        )
        .map(responses => {
          // MetronomeResult
          return {
            count: responses.length,
            items: responses.map(response => {
              // MetronomeItem
              return isNamespace(response)
                ? response2Namespace(response)
                : response2Job(response);
            })
          };
        });
    },
    metronomeItem(_obj = {}, _args = {}, _context = {}) {
      return Observable.of({});
    }
  }
});

export const defaultSchema = makeExecutableSchema({
  typeDefs,
  resolvers: {} // TODO: fill with real interval and API
});
