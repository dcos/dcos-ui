import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs/Observable";
import {
  fetchJobs,
  fetchJobDetail,
  JobResponse as MetronomeJobResponse,
  JobDetailResponse as MetronomeJobDetailResponse
} from "#SRC/js/events/MetronomeClient";

import Config from "#SRC/js/config/Config";
import JobStatusInformation from "#PLUGINS/jobs/src/js/types/JobStatus";
import JobRunStatusInformation from "#PLUGINS/jobs/src/js/types/JobRunStatus";
import {
  JobConnection,
  JobConnectionSchema
} from "#PLUGINS/jobs/src/js/types/JobConnection";
import {
  Job,
  JobTypeResolver,
  JobSchema
} from "#PLUGINS/jobs/src/js/types/Job";

export interface Query {
  jobs: JobConnection | null;
  job: Job | null;
}

export interface ResolverArgs {
  fetchJobs: () => Observable<MetronomeJobResponse[]>;
  fetchJobDetail: (id: string) => Observable<MetronomeJobDetailResponse>;
  pollingInterval: number;
}

export interface GeneralArgs {
  [key: string]: any;
}

export interface JobsQueryArgs {
  filter?: string;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
}

export interface JobQueryArgs {
  id: string;
}

export type SortOption = "ID" | "STATUS" | "LAST_RUN";

export type SortDirection = "ASC" | "DESC";

export const typeDefs = `
  ${JobSchema}
  ${JobConnectionSchema}

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

function isJobQueryArg(arg: any): arg is JobQueryArgs {
  return arg.id !== undefined;
}

// Sort and filtering
function sortJobs(
  jobs: Job[],
  sortBy: SortOption = "ID",
  sortDirection: SortDirection = "ASC"
): Job[] {
  jobs.sort((a, b) => {
    let result;

    switch (sortBy) {
      case "ID":
        result = sortJobById(a, b);
        break;
      case "STATUS":
        result = sortJobByStatus(a, b);
        break;
      case "LAST_RUN":
        result = sortJobByLastRun(a, b);
        break;
      default:
        result = 0;
    }

    const direction = sortDirection === "ASC" ? 1 : -1;
    return result * direction;
  });

  return jobs;
}

function sortJobById(a: Job, b: Job): number {
  return a.id.localeCompare(b.id);
}

function sortJobByStatus(a: Job, b: Job): number {
  return (
    JobStatusInformation[a.scheduleStatus].sortOrder -
    JobStatusInformation[b.scheduleStatus].sortOrder
  );
}

function sortJobByLastRun(a: Job, b: Job): number {
  return (
    JobRunStatusInformation[a.lastRunStatus.status].sortOrder -
    JobRunStatusInformation[b.lastRunStatus.status].sortOrder
  );
}

function filterJobs(
  jobs: MetronomeJobResponse[],
  filter: string | null
): MetronomeJobResponse[] {
  if (filter === null) {
    return jobs;
  }

  return jobs.filter(({ id }) => id.includes(filter));
}

export const resolvers = ({
  fetchJobDetail,
  pollingInterval
}: ResolverArgs): IResolvers => ({
  Query: {
    jobs(
      _obj = {},
      args: GeneralArgs = {},
      _context = {}
    ): Observable<JobConnection | null> {
      // TODO: type guard
      const {
        sortBy = "ID",
        sortDirection = "ASC",
        filter = null
      } = args as JobsQueryArgs;

      const pollingInterval$ = Observable.timer(0, pollingInterval);
      const responses$ = pollingInterval$.switchMap(fetchJobs);
      const totalCount$ = responses$.map(jobs => jobs.length);

      return (
        responses$
          .map(jobs => filterJobs(jobs, filter))
          //TODO We need to remove the N + 1 query
          // https://jira.mesosphere.com/browse/DCOS-38201
          .map(jobs => jobs.map(job => fetchJobDetail(job.id)))
          .switchMap(obs => Observable.combineLatest(obs))
          .map(requests => requests.map(JobTypeResolver))
          .map(jobs => sortJobs(jobs, sortBy, sortDirection))
          .combineLatest(totalCount$, (jobs, totalCount) => ({
            filteredCount: jobs.length,
            totalCount,
            nodes: jobs
          }))
      );
    },
    job(_obj = {}, args: GeneralArgs, _context = {}): Observable<Job | null> {
      if (!isJobQueryArg(args)) {
        return Observable.throw("The job resolver expects an id as argument");
      }

      const pollingInterval$ = Observable.timer(0, pollingInterval);
      const responses$ = pollingInterval$.switchMap(() =>
        fetchJobDetail(args.id)
      );

      return responses$.map(response => JobTypeResolver(response));
    }
  }
});

export default makeExecutableSchema({
  typeDefs,
  resolvers: resolvers({
    fetchJobs,
    fetchJobDetail,
    pollingInterval: Config.getRefreshRate()
  })
});
