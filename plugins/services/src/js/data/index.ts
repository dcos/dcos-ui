import { makeExecutableSchema } from "graphql-tools";
import { ServicePlanStatusSchema } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlanStepSchema } from "#PLUGINS/services/src/js/types/ServicePlanStep";
import { ServicePlanPhaseSchema } from "#PLUGINS/services/src/js/types/ServicePlanPhase";
import {
  ServicePlan,
  ServicePlanSchema
} from "#PLUGINS/services/src/js/types/ServicePlan";
import { Service, ServiceSchema } from "#PLUGINS/services/src/js/types/Service";
import { Observable } from "rxjs";
import { RequestResponse } from "@dcos/http-service";
import {
  fetchPlanDetails as fetchServicePlanDetail,
  fetchPlans as fetchServicePlans,
  ServicePlanResponse
} from "#PLUGINS/services/src/js/data/ServicePlansClient";
import Config from "#SRC/js/config/Config";

export interface ResolverArgs {
  fetchServicePlans: (
    serviceName: string
  ) => Observable<RequestResponse<string[]>>;
  fetchServicePlanDetail: (
    serviceName: string,
    planName: string
  ) => Observable<RequestResponse<ServicePlanResponse>>;
  pollingInterval: number;
}

export interface GeneralArgs {
  [key: string]: any;
}

export interface ServiceQueryArgs {
  name: string;
}

function isServiceQueryArgs(args: GeneralArgs): args is ServiceQueryArgs {
  return (args as ServiceQueryArgs).name !== undefined;
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
      if (!parent.name) {
        return Observable.throw(
          "Service name must be available to resolve plans"
        );
      }

      const pollingInterval$ = Observable.timer(0, pollingInterval);
      if (isPlansQueryArgs(args)) {
        // If we're given a plan name, then only query that plan
        const plan$ = pollingInterval$
          .switchMap(() => fetchServicePlanDetail(parent.name, args.name))
          .map(
            (reqResp: RequestResponse<ServicePlanResponse>): ServicePlan[] => [
              { name: args.name, ...reqResp.response }
            ]
          );

        return plan$;
      } else {
        // Otherwise query for all the service's plans, then pull details for each
        // plan. Finally combine all of the detail's query observables.
        const plans$ = pollingInterval$
          .switchMap(() =>
            fetchServicePlans(parent.name)
              .map(({ response }) => response)
              .map((plans: string[]) => {
                return plans.map(name => ({ name }));
              })
          )
          .switchMap(plans => {
            const planDetails = plans.map(plan => {
              return fetchServicePlanDetail(parent.name, plan.name).map(
                ({ response }) => ({ name: plan.name, ...response })
              );
            });
            return Observable.combineLatest(...planDetails);
          });

        return plans$;
      }
    }
  },
  Query: {
    service(_parent = {}, args: GeneralArgs = {}) {
      if (!isServiceQueryArgs(args)) {
        return Observable.throw(
          "Service resolver arguments aren't valid for type ServiceQueryArgs"
        );
      }

      return Observable.of({ name: args.name });
    }
  }
});

const baseSchema = `
type Query {
  service(name: String!): Service
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
