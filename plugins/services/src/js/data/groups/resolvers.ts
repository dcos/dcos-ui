import { IResolvers } from "graphql-tools";
import { Observable, of, throwError, timer } from "rxjs";
import {
  map,
  exhaustMap,
  publishReplay,
  refCount,
  switchMap,
  catchError
} from "rxjs/operators";

import { fetchServiceGroups, fetchRoles } from "./fetchers";
import ServiceTree from "../../structs/ServiceTree";
import { ServiceGroup, ServiceGroupQuota } from "../../types/ServiceGroup";
import { MesosRole } from "../../types/MesosRoles";
import {
  getQuotaLimit,
  quotaHasLimit,
  populateResourcesFromRole
} from "../../utils/QuotaUtil";

import { createGroup, editGroup } from "../MarathonClient";
import { updateQuota, UpdateQuotaError } from "../MesosClient";
import { GroupFormData, GroupMutationResponse } from "../../types/GroupForm";
import { GroupCreateError } from "../errors/GroupCreateError";
import { GroupEditError } from "../errors/GroupEditError";

export interface ServiceGroupQueryArgs {
  id: string;
}
const isGroupArgs = (
  args: Record<string, any>
): args is ServiceGroupQueryArgs => {
  return (args as ServiceGroupQueryArgs).id !== undefined;
};
export interface GroupCreateArgs {
  data: GroupFormData;
}
const isGroupMutationArgs = (args: object): args is GroupCreateArgs =>
  args.hasOwnProperty("data");

function processServiceGroup(serviceTree: ServiceTree): ServiceGroup {
  const groupName = serviceTree.getName();
  const serviceRoles = serviceTree.getQuotaRoleStats();
  return {
    id: serviceTree.getId(),
    name: groupName,
    quota: {
      enforced: serviceTree.getEnforceRole() === true,
      limitStatus: "N/A",
      serviceRoles: {
        count: serviceRoles.count,
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
  const makeGroups$ = () => timer$.pipe(switchMap(fetchServiceGroups));
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
        return makeGroups$().pipe(
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
      },
      roles() {
        return roles$;
      }
    },
    Mutation: {
      createGroup(
        _parent = {},
        args: Record<string, unknown> = {}
      ): Observable<GroupMutationResponse> {
        if (!isGroupMutationArgs(args)) {
          return throwError(
            "createGroup mutation arguments aren't valid for type GroupCreateArgs"
          );
        }
        return createGroup(args.data.id, args.data.enforceRole).pipe(
          map(() => {
            return "SUCCESS";
          }),
          switchMap(() => {
            return updateQuota(args.data.id, args.data.quota).pipe(
              map(updateResp => ({
                code: 200,
                success: true,
                message: updateResp,
                partialSuccess: false
              }))
            );
          }),
          catchError((err: Error | GroupCreateError) => {
            if (err.name === "GroupCreateError") {
              const createError = err as GroupCreateError;
              return of({
                code: createError.responseCode,
                success: false,
                message: createError.message,
                partialSuccess: false
              });
            } else if (err.name === "UpdateQuotaError") {
              const quotaErr = err as UpdateQuotaError;
              return of({
                code: 0,
                success: false,
                message: quotaErr.message,
                partialSuccess: true
              });
            }
            return of({
              code: 0,
              success: false,
              message: err.message,
              partialSuccess: false
            });
          })
        );
      },
      editGroup(
        _parent = {},
        args: Record<string, unknown> = {}
      ): Observable<GroupMutationResponse> {
        if (!isGroupMutationArgs(args)) {
          return throwError(
            "editGroup mutation arguments aren't valid for type GroupCreateArgs"
          );
        }
        // TODO: Check types and be smart about API calls.
        return editGroup(args.data.id, args.data.enforceRole).pipe(
          map(() => {
            return "SUCCESS";
          }),
          switchMap(groupResp => {
            if (groupResp !== "SUCCESS") {
              return of({
                code: 0,
                success: false,
                message: groupResp,
                partialSuccess: false
              });
            }
            return updateQuota(args.data.id, args.data.quota).pipe(
              map(updateResp => ({
                code: 200,
                success: true,
                message: updateResp,
                partialSuccess: true
              }))
            );
          }),
          catchError((err: Error | GroupEditError) => {
            if (err.name === "GroupEditError") {
              const createError = err as GroupEditError;
              return of({
                code: createError.responseCode,
                success: false,
                message: createError.message,
                partialSuccess: false
              });
            } else if (err.name === "UpdateQuotaError") {
              const quotaErr = err as UpdateQuotaError;
              return of({
                code: 0,
                success: false,
                message: quotaErr.message,
                partialSuccess: true
              });
            }
            return of({
              code: 0,
              success: false,
              message: err.message,
              partialSuccess: false
            });
          })
        );
      }
    }
  };
}
