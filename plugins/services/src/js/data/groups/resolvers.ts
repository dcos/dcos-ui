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
import {
  ServiceGroup,
  ServiceGroupQuota,
  ServiceGroupQuotaLimit,
  ServiceGroupQuotaRoles
} from "../../types/ServiceGroup";
import { MesosRole } from "../../types/MesosRoles";
import { filterByObject } from "../../filters/GenericObject";
import { i18nMark } from "@lingui/core";

export interface ServiceGroupQueryArgs {
  id: string;
}
const isGroupArgs = (
  args: Record<string, any>
): args is ServiceGroupQueryArgs => {
  return (args as ServiceGroupQueryArgs).id !== undefined;
};

function getQuotaLimit(
  roles: ServiceGroupQuotaRoles | undefined
): ServiceGroupQuotaLimit {
  if (roles === undefined) {
    return i18nMark("N/A") as ServiceGroupQuotaLimit;
  }
  // All roles are group role or 0 roles.
  if (!roles.count || roles.count === roles.groupRoleCount) {
    return i18nMark("Enforced") as ServiceGroupQuotaLimit;
  }

  // At least one role and 0 group roles.
  if (roles.count && !roles.groupRoleCount) {
    return i18nMark("Not Enforced") as ServiceGroupQuotaLimit;
  }

  // At least one group role, at least one non-group role.
  if (roles.groupRoleCount && roles.count > roles.groupRoleCount) {
    return i18nMark("Partially Enforced") as ServiceGroupQuotaLimit;
  }

  return i18nMark("N/A") as ServiceGroupQuotaLimit;
}

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

function processServiceGroupFilter(
  groups: ServiceGroup[],
  filterArg: unknown
): ServiceGroup[] {
  if (typeof filterArg !== "string") {
    return groups;
  }
  try {
    const filter = JSON.parse(filterArg);
    return groups.filter(group => filterByObject(group, filter));
  } catch {
    return groups;
  }
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
        if (!parent.quota || !parent.quota.enforced) {
          return of({ enforced: false });
        }
        const { id, quota } = parent;
        return roles$.pipe(
          switchMap((roles: MesosRole[]) => {
            const result: ServiceGroupQuota = {
              enforced: quota.enforced,
              limitStatus: quota.limitStatus,
              serviceRoles: quota.serviceRoles
            };
            result.cpus = {};
            result.memory = {};
            result.disk = {};
            result.gpus = {};

            const groupRole = roles.find(role => id === `/${role.name}`);
            if (groupRole) {
              result.limitStatus = getQuotaLimit(quota.serviceRoles);
              const getValue = (val: unknown) => {
                return val !== undefined && typeof val === "number"
                  ? val
                  : undefined;
              };
              const { quota: groupQuota } = groupRole;
              if (groupQuota) {
                if (groupQuota.guarantee) {
                  result.cpus.guarantee = getValue(groupQuota.guarantee.cpus);
                  result.memory.guarantee = getValue(groupQuota.guarantee.mem);
                  result.disk.guarantee = getValue(groupQuota.guarantee.disk);
                  result.gpus.guarantee = getValue(groupQuota.guarantee.gpus);
                }
                if (groupQuota.limit) {
                  result.cpus.limit = getValue(groupQuota.limit.cpus);
                  result.memory.limit = getValue(groupQuota.limit.mem);
                  result.disk.limit = getValue(groupQuota.limit.disk);
                  result.gpus.limit = getValue(groupQuota.limit.gpus);
                }
                if (groupQuota.consumption) {
                  result.cpus.consumed = getValue(groupQuota.consumption.cpus);
                  result.memory.consumed = getValue(groupQuota.consumption.mem);
                  result.disk.consumed = getValue(groupQuota.consumption.disk);
                  result.gpus.consumed = getValue(groupQuota.consumption.gpus);
                }
              }
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
      groups(_parent = {}, args: Record<string, unknown> = {}) {
        return groups$.pipe(
          map(groups => groups.map(processServiceGroup)),
          map(groups =>
            args["filter"] && args["filter"] !== ""
              ? processServiceGroupFilter(groups, args["filter"])
              : groups
          )
        );
      }
    }
  };
}
