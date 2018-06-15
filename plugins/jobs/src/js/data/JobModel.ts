import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs/Observable";
import {
  fetchJobDetail,
  JobDetailResponse as MetronomeJobDetailResponse
} from "#SRC/js/events/MetronomeClient";

import Config from "#SRC/js/config/Config";
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
  fetchJobDetail: (id: string) => Observable<MetronomeJobDetailResponse>;
  pollingInterval: number;
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
    fetchJobDetail,
    pollingInterval: Config.getRefreshRate()
  })
});
