import { i18nMark } from "@lingui/core";
import {
  QuotaResources,
  ServiceGroup,
  ServiceGroupQuota,
  ServiceGroupQuotaLimit,
  ServiceGroupQuotaRoles
} from "../types/ServiceGroup";
import { MesosRole } from "#PLUGINS/services/src/js/types/MesosRoles";

export function quotaHasLimit(
  quota: ServiceGroupQuota | null | undefined
): boolean {
  if (!quota) {
    return false;
  }
  const metrics: Array<QuotaResources | undefined | null> = [
    quota.cpus,
    quota.memory,
    quota.disk,
    quota.gpus
  ];
  for (let metric of metrics) {
    if (metric && (metric.limit !== null && metric.limit !== undefined)) {
      return true;
    }
  }
  return false;
}

export function groupHasQuotaLimit(group: ServiceGroup): boolean {
  return quotaHasLimit(group.quota);
}

export function populateResourcesFromRole(
  quota: ServiceGroupQuota,
  groupRole: MesosRole
): ServiceGroupQuota {
  const getValue = (val: unknown) => {
    return val !== undefined && typeof val === "number" ? val : undefined;
  };
  const { quota: groupQuota } = groupRole;
  if (groupQuota) {
    quota.cpus = {};
    quota.memory = {};
    quota.disk = {};
    quota.gpus = {};
    if (groupQuota.guarantee) {
      quota.cpus.guarantee = getValue(groupQuota.guarantee.cpus);
      quota.memory.guarantee = getValue(groupQuota.guarantee.mem);
      quota.disk.guarantee = getValue(groupQuota.guarantee.disk);
      quota.gpus.guarantee = getValue(groupQuota.guarantee.gpus);
    }
    if (groupQuota.limit) {
      quota.cpus.limit = getValue(groupQuota.limit.cpus);
      quota.memory.limit = getValue(groupQuota.limit.mem);
      quota.disk.limit = getValue(groupQuota.limit.disk);
      quota.gpus.limit = getValue(groupQuota.limit.gpus);
    }
    if (groupQuota.consumed) {
      quota.cpus.consumed = getValue(groupQuota.consumed.cpus) || 0;
      quota.memory.consumed = getValue(groupQuota.consumed.mem) || 0;
      quota.disk.consumed = getValue(groupQuota.consumed.disk) || 0;
      quota.gpus.consumed = getValue(groupQuota.consumed.gpus) || 0;
    } else {
      quota.cpus.consumed = 0;
      quota.memory.consumed = 0;
      quota.disk.consumed = 0;
      quota.gpus.consumed = 0;
    }
  }

  return quota;
}

export function getQuotaLimit(
  roles: ServiceGroupQuotaRoles | undefined | null
): ServiceGroupQuotaLimit {
  if (roles === undefined || roles === null) {
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
