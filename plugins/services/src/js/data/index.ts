import { Observable, throwError, timer, combineLatest, of } from "rxjs";
import { switchMap, map, retry } from "rxjs/operators";
import { RequestResponse } from "@dcos/http-service";
import { makeExecutableSchema } from "graphql-tools";

import { ServicePlanStatusSchema } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlanStepSchema } from "#PLUGINS/services/src/js/types/ServicePlanStep";
import { ServicePlanPhaseSchema } from "#PLUGINS/services/src/js/types/ServicePlanPhase";
import {
  ServicePlan,
  ServicePlanSchema
} from "#PLUGINS/services/src/js/types/ServicePlan";
import { Service, ServiceSchema } from "#PLUGINS/services/src/js/types/Service";
import {
  fetchPlanDetails as fetchServicePlanDetail,
  fetchPlans as fetchServicePlans,
  ServicePlanResponse
} from "#PLUGINS/services/src/js/data/ServicePlansClient";
import Config from "#SRC/js/config/Config";

export interface ResolverArgs {
  fetchServicePlans: (
    serviceId: string
  ) => Observable<RequestResponse<string[]>>;
  fetchServicePlanDetail: (
    serviceId: string,
    planName: string
  ) => Observable<RequestResponse<ServicePlanResponse>>;
  pollingInterval: number;
}

export interface GeneralArgs {
  [key: string]: any;
}

export interface ServiceQueryArgs {
  id: string;
}

function isServiceQueryArgs(args: GeneralArgs): args is ServiceQueryArgs {
  return (args as ServiceQueryArgs).id !== undefined;
}

export interface PlansQueryArgs {
  name: string;
}

function isPlansQueryArgs(args: GeneralArgs): args is PlansQueryArgs {
  return (args as PlansQueryArgs).name !== undefined;
}

export const resolvers = ({
  fetchServicePlans,
  fetchServicePlanDetail,
  pollingInterval
}: ResolverArgs) => ({
  Service: {
    plans(parent: any, args: GeneralArgs = {}) {
      if (!parent.id) {
        return throwError("Service ID must be available to resolve plans");
      }

      const pollingInterval$ = timer(0, pollingInterval);
      if (isPlansQueryArgs(args)) {
        // If we're given a plan name, then only query that plan
        const plan$ = pollingInterval$.pipe(
          switchMap(() =>
            fetchServicePlanDetail(parent.id, args.name).pipe(retry(2))
          ),
          map(
            (reqResp: RequestResponse<ServicePlanResponse>): ServicePlan[] => [
              { name: args.name, ...reqResp.response }
            ]
          )
        );

        return plan$;
      } else {
        // Otherwise query for all the service's plans, then pull details for each
        // plan. Finally combine all of the detail's query observables.
        const plans$ = pollingInterval$.pipe(
          switchMap(() =>
            fetchServicePlans(parent.id).pipe(
              retry(2),
              map(({ response }) => response),
              map((plans: string[]) => {
                return plans.map(name => ({ name }));
              })
            )
          ),
          switchMap(plans => {
            const planDetails = plans.map(plan => {
              return fetchServicePlanDetail(parent.id, plan.name).pipe(
                retry(2),
                map(({ response }) => ({ name: plan.name, ...response }))
              );
            });
            return combineLatest(...planDetails);
          })
        );

        return plans$;
      }
    }
  },
  Query: {
    service(_parent = {}, args: GeneralArgs = {}) {
      if (!isServiceQueryArgs(args)) {
        return throwError(
          "Service resolver arguments aren't valid for type ServiceQueryArgs"
        );
      }

      return of({ id: args.id });
    }
  }
});

const baseSchema = `
type Query {
  service(id: String!): Service
}
`;

//Load All Sub Schemas
export const schemas: string[] = [
  ServicePlanStatusSchema,
  ServicePlanStepSchema,
  ServicePlanPhaseSchema,
  ServicePlanSchema,
  ServiceSchema,
  baseSchema
];

export interface Query {
  service: Service | null;
}

export default makeExecutableSchema({
  typeDefs: schemas,
  resolvers: resolvers({
    fetchServicePlans,
    fetchServicePlanDetail,
    pollingInterval: Config.getRefreshRate()
  })
});
