import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs/Observable";
import {
  createJob,
  fetchJobs,
  fetchJobDetail,
  runJob,
  updateSchedule,
  updateJob,
  deleteJob,
  stopJobRun,
  JobResponse as MetronomeJobResponse,
  JobDetailResponse as MetronomeJobDetailResponse
} from "#SRC/js/events/MetronomeClient";
import { RequestResponse } from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import {
  JobConnection,
  JobConnectionSchema,
  JobConnectionTypeResolver,
  JobsQueryArgs
} from "#PLUGINS/jobs/src/js/types/JobConnection";
import {
  Job,
  JobTypeResolver,
  JobSchema
} from "#PLUGINS/jobs/src/js/types/Job";
import { JobLink, JobLinkSchema } from "#PLUGINS/jobs/src/js/types/JobLink";

export interface Query {
  jobs: JobConnection | null;
  job: Job | null;
}

export interface ResolverArgs {
  fetchJobs: () => Observable<RequestResponse<MetronomeJobResponse[]>>;
  fetchJobDetail: (
    id: string
  ) => Observable<RequestResponse<MetronomeJobDetailResponse>>;
  pollingInterval: number;
  runJob: (id: string) => Observable<RequestResponse<JobLink>>;
  createJob: (
    data: MetronomeJobDetailResponse
  ) => Observable<RequestResponse<MetronomeJobDetailResponse>>;
  updateJob: (
    id: string,
    data: MetronomeJobDetailResponse
  ) => Observable<RequestResponse<MetronomeJobDetailResponse>>;
  updateSchedule: (
    id: string,
    data: MetronomeJobDetailResponse
  ) => Observable<RequestResponse<JobLink>>;
  deleteJob: (
    id: string,
    stopCurrentJobRuns: boolean
  ) => Observable<RequestResponse<JobLink>>;
  stopJobRun: (
    id: string,
    jobRunId: string
  ) => Observable<RequestResponse<JobLink>>;
}

export interface GeneralArgs {
  [key: string]: any;
}

export interface JobQueryArgs {
  id: string;
}

export const typeDefs = `
  ${JobSchema}
  ${JobLinkSchema}
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
      path: String
      sortBy: SortOption
      sortDirection: SortDirection
    ): JobConnection!
    job(
      id: ID!
    ): Job
  }

  `;

function isJobQueryArg(arg: GeneralArgs): arg is JobQueryArgs {
  return (arg as JobQueryArgs).id !== undefined;
}

function isJobsQueryArg(arg: GeneralArgs): arg is JobsQueryArgs {
  return (arg as JobsQueryArgs).path !== undefined;
}

export const resolvers = ({
  fetchJobs,
  fetchJobDetail,
  pollingInterval,
  runJob,
  createJob,
  updateJob,
  updateSchedule,
  deleteJob,
  stopJobRun
}: ResolverArgs): IResolvers => {
  const jobs$ = Observable.timer(0, pollingInterval)
    .exhaustMap(fetchJobs)
    .publishReplay(1)
    .refCount();

  return {
    Query: {
      jobs(
        _parent = {},
        args: GeneralArgs = {},
        _context = {}
      ): Observable<JobConnection> {
        if (!isJobsQueryArg(args)) {
          return Observable.throw(
            "Jobs resolver arguments arent valid for type JobsQueryArgs"
          );
        }

        return jobs$.map(({ response }) =>
          JobConnectionTypeResolver(response, args)
        );
      },
      job(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<Job | null> {
        if (!isJobQueryArg(args)) {
          return Observable.throw(
            "Job resolver arguments arent valid for type JobQueryArgs"
          );
        }

        const pollingInterval$ = Observable.timer(0, pollingInterval);
        const responses$ = pollingInterval$.switchMap(() =>
          fetchJobDetail(args.id).map(({ response }) => response)
        );

        return responses$.map(response => JobTypeResolver(response));
      }
    }
  };
};

export default makeExecutableSchema({
  typeDefs,
  resolvers: resolvers({
    fetchJobs,
    fetchJobDetail,
    pollingInterval: Config.getRefreshRate(),
    runJob,
    createJob,
    updateJob,
    updateSchedule,
    deleteJob,
    stopJobRun
  })
});
