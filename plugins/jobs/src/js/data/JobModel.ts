import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs/Observable";
import {
  fetchJobs,
  fetchJobDetail,
  runJob,
  JobResponse as MetronomeJobResponse,
  JobDetailResponse as MetronomeJobDetailResponse
} from "#SRC/js/events/MetronomeClient";

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
  fetchJobs: () => Observable<MetronomeJobResponse[]>;
  fetchJobDetail: (id: string) => Observable<MetronomeJobDetailResponse>;
  pollingInterval: number;
  runJob: (id: string) => Observable<JobLink>;
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
  
  type Mutation {
    runJob(id: String!): JobLink!
  }
  `;

function isJobQueryArg(arg: any): arg is JobQueryArgs {
  return arg.id !== undefined;
}

function isJobsQueryArg(arg: GeneralArgs): arg is JobsQueryArgs {
  return (arg as JobsQueryArgs).path !== undefined;
}

export const resolvers = ({
  fetchJobs,
  fetchJobDetail,
  pollingInterval,
  runJob
}: ResolverArgs): IResolvers => ({
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

      return Observable.timer(0, pollingInterval)
        .exhaustMap(fetchJobs)
        .map(response => JobConnectionTypeResolver(response, args));
    },
    job(
      _parent = {},
      args: GeneralArgs,
      _context = {}
    ): Observable<Job | null> {
      if (!isJobQueryArg(args)) {
        return Observable.throw("The job resolver expects an id as argument");
      }

      const pollingInterval$ = Observable.timer(0, pollingInterval);
      const responses$ = pollingInterval$.switchMap(() =>
        fetchJobDetail(args.id)
      );

      return responses$.map(response => JobTypeResolver(response));
    }
  },
  Mutation: {
    runJob(
      _parent = {},
      args: GeneralArgs,
      _context = {}
    ): Observable<JobLink> {
      return runJob(args.id).map(({ jobId }) => ({ jobId }));
    }
  }
});

export default makeExecutableSchema({
  typeDefs,
  resolvers: resolvers({
    fetchJobs,
    fetchJobDetail,
    pollingInterval: Config.getRefreshRate(),
    runJob
  })
});
