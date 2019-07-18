import { IResolvers } from "graphql-tools";
import { of, throwError, timer } from "rxjs";
import {
  map,
  exhaustMap,
  publishReplay,
  refCount,
  switchMap
} from "rxjs/operators";

import { fetchServiceGroups, fetchRoles } from "./fetchers";
import ServiceTree from "../../structs/ServiceTree";
import { ServiceGroup, ServiceGroupQuota } from "../../types/ServiceGroup";
import { MesosRole } from "../../types/MesosRoles";
import {
  getQuotaLimit,
  quotaHasLimit,
  populateResourcesFromRole
} from "#PLUGINS/services/src/js/utils/QuotaUtil";

export interface ServiceGroupQueryArgs {
  id: string;
}
const isGroupArgs = (
  args: Record<string, any>
): args is ServiceGroupQueryArgs => {
  return (args as ServiceGroupQueryArgs).id !== undefined;
};

function processServiceGroup(serviceTree: ServiceTree): ServiceGroup {
  const groupName = serviceTree.getName();
  const serviceRoles = serviceTree.getRoleLength();
  return {
    id: serviceTree.getId(),
    name: groupName,
    quota: {
      enforced: serviceTree.getEnforceRole() === true,
      limitStatus: "N/A",
      serviceRoles: {
        count: serviceRoles.servicesCount,
        groupRoleCount: serviceRoles.groupRolesCount
      }
    }
  };
}

export interface ResolverArgs {
  pollingInterval: number;
}

export function resolvers({ pollingInterval }: ResolverArgs): IResolvers {
  const timer$ = timer(0, pollingInterval);
  const roles$ = timer$.pipe(
    exhaustMap(fetchRoles),
    publishReplay(1),
    refCount()
  );
  const groups$ = timer$.pipe(
    switchMap(fetchServiceGroups),
    publishReplay(1),
    refCount()
  );

  return {
    ServiceGroup: {
      quota(parent: ServiceGroup) {
        if (!parent.quota) {
          return of({ enforced: false });
        }
        const { id, quota } = parent;
        return roles$.pipe(
          switchMap((roles: MesosRole[]) => {
            let result: ServiceGroupQuota = {
              enforced: quota.enforced,
              limitStatus: quota.limitStatus,
              serviceRoles: quota.serviceRoles
            };

            const groupRole = roles.find(role => id === `/${role.name}`);
            if (groupRole) {
              result = populateResourcesFromRole(result, groupRole);
            }
            if (quotaHasLimit(result)) {
              result.limitStatus = getQuotaLimit(quota.serviceRoles);
            }
            return of(result);
          })
        );
      }
    },
    Query: {
      group(_parent = {}, args: Record<string, unknown> = {}) {
        if (!isGroupArgs(args)) {
          return throwError(
            "Group resolver arguments aren't valid for type ServiceGroupQueryArgs"
          );
        }
        return groups$.pipe(
          map(groups => {
            const group = groups.find(
              serviceTree => serviceTree.getId() === args.id
            );
            return group ? processServiceGroup(group) : null;
          })
        );
      },
      groups() {
        return groups$.pipe(map(groups => groups.map(processServiceGroup)));
      }
    }
  };
}
