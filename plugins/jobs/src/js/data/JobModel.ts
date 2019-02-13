import { throwError, timer, Observable } from "rxjs";
import {
  exhaustMap,
  publishReplay,
  refCount,
  map,
  switchMap
} from "rxjs/operators";
import { IResolvers } from "graphql-tools";
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
import { DataLayerExtensionInterface } from "@extension-kid/data-layer";
import { injectable } from "inversify";

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
  extend type Query {
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

  extend type Mutation {
    runJob(id: String!): JobLink!
    createJob(data: Job!): JobLink!
    updateJob(id: String!, data: Job!): JobLink!
    updateSchedule(id: String!, data: Job!): JobLink!
    deleteJob(id: String!, stopCurrentJobRuns: Boolean!): JobLink!
    stopJobRun(id: String!, jobRunid: String!): JobLink!
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
  const jobs$ = timer(0, pollingInterval).pipe(
    exhaustMap(fetchJobs),
    publishReplay(1),
    refCount()
  );

  return {
    Query: {
      jobs(
        _parent = {},
        args: GeneralArgs = {},
        _context = {}
      ): Observable<JobConnection> {
        if (!isJobsQueryArg(args)) {
          return throwError(
            "Jobs resolver arguments arent valid for type JobsQueryArgs"
          );
        }

        return jobs$.pipe(
          map(({ response }) => JobConnectionTypeResolver(response, args))
        );
      },
      job(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<Job | null> {
        if (!isJobQueryArg(args)) {
          return throwError(
            "Job resolver arguments arent valid for type JobQueryArgs"
          );
        }

        const pollingInterval$ = timer(0, pollingInterval);
        const responses$ = pollingInterval$.pipe(
          switchMap(() =>
            fetchJobDetail(args.id).pipe(map(({ response }) => response))
          )
        );

        return responses$.pipe(map(response => JobTypeResolver(response)));
      }
    },
    Mutation: {
      runJob(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<JobLink> {
        if (!args.id) {
          return throwError({
            response: { message: "runJob requires the `id` of the job to run" }
          });
        }

        return runJob(args.id).pipe(
          map(({ response: { jobId } }) => ({ jobId }))
        );
      },
      updateSchedule(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<JobLink> {
        if (!args.id || !args.data) {
          return throwError({
            response: {
              message:
                "updateSchedule requires the `id` and `data` of the job to run"
            }
          });
        }

        return updateSchedule(args.id, args.data).pipe(
          map(({ response: { jobId } }) => ({
            jobId
          }))
        );
      },
      createJob(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<MetronomeJobDetailResponse> {
        if (!args.data) {
          return throwError({
            response: { message: "createJob requires `data` to be provided!" }
          });
        }

        return createJob(args.data).pipe(map(({ response }) => response));
      },
      deleteJob(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<JobLink> {
        const stopCurrentJobRunsIsBoolean =
          typeof args.stopCurrentJobRuns === "boolean";

        if (!args.id || !stopCurrentJobRunsIsBoolean) {
          return throwError({
            response: {
              message:
                "deleteJob requires both `id` and `stopCurrentJobRuns` to" +
                " be provided!"
            }
          });
        }

        return deleteJob(args.id, args.stopCurrentJobRuns).pipe(
          map(({ response: { jobId } }) => ({
            jobId
          }))
        );
      },
      stopJobRun(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<JobLink> {
        if (!args.id || !args.jobRunId) {
          return throwError({
            response: {
              message:
                "stopJobRun requires both `id` and `jobRunId` to be provided!"
            }
          });
        }

        return stopJobRun(args.id, args.jobRunId).pipe(
          map(({ response: { jobId } }) => ({
            jobId
          }))
        );
      },
      updateJob(
        _parent = {},
        args: GeneralArgs,
        _context = {}
      ): Observable<MetronomeJobDetailResponse> {
        if (!args.id || !args.data) {
          return throwError({
            response: {
              message: "updateJob requires both `id` and `data` to be provided!"
            }
          });
        }

        return updateJob(args.id, args.data).pipe(
          map(({ response }) => response)
        );
      }
    }
  };
};

const boundResolvers = resolvers({
  fetchJobs,
  fetchJobDetail,
  pollingInterval: Config.getRefreshRate(),
  runJob,
  createJob,
  updateJob,
  updateSchedule,
  deleteJob,
  stopJobRun
});

const JobType = Symbol("Job");
// tslint:disable-next-line
@injectable()
export class JobExtension implements DataLayerExtensionInterface {
  id = JobType;

  getResolvers() {
    return boundResolvers;
  }

  getTypeDefinitions() {
    return typeDefs;
  }
}
