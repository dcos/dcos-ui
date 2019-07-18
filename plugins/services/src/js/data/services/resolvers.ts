import { IResolvers } from "graphql-tools";
import { combineLatest, Observable, of, throwError, timer } from "rxjs";
import { RequestResponse } from "@dcos/http-service";
import { ServicePlanResponse } from "#PLUGINS/services/src/js/data/ServicePlansClient";
import { map, retry, switchMap } from "rxjs/operators";
import { ServicePlan } from "#PLUGINS/services/src/js/types/ServicePlan";

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

export interface ServiceResolverArgs {
  fetchServicePlans: (
    serviceId: string
  ) => Observable<RequestResponse<string[]>>;
  fetchServicePlanDetail: (
    serviceId: string,
    planName: string
  ) => Observable<RequestResponse<ServicePlanResponse>>;
  pollingInterval: number;
}

export function resolvers({
  fetchServicePlans,
  fetchServicePlanDetail,
  pollingInterval
}: ServiceResolverArgs): IResolvers {
  return {
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
              (
                reqResp: RequestResponse<ServicePlanResponse>
              ): ServicePlan[] => [{ name: args.name, ...reqResp.response }]
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
  };
}
