import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { i18nMark } from "@lingui/react";

export type QuotaResources = {
  guarantee?: number;
  limit?: number;
  effectiveLimit?: number;
  consumed?: number;
};

export type ServiceGroupQuotaRoles = {
  count: number;
  groupRoleCount: number;
};

export const QuotaLimitStatuses: {
  enforced: string;
  notEnforced: string;
  partiallyEnforced: string;
  na: string;
} = {
  enforced: i18nMark("Enforced"),
  notEnforced: i18nMark("Not Enforced"),
  partiallyEnforced: i18nMark("Partially Enforced"),
  na: i18nMark("N/A")
};

export type ServiceGroupQuota = {
  enforced: boolean;
  limitStatus: string;
  serviceRoles?: ServiceGroupQuotaRoles;
  cpus?: QuotaResources;
  memory?: QuotaResources;
  disk?: QuotaResources;
  gpus?: QuotaResources;
};

export type ServiceGroup = {
  id: string;
  name: string;
  quota?: null | ServiceGroupQuota;
};

function getQuotaPercentage(group: ServiceGroup, resource: string) {
  const resourceQuota = getQuota(group, resource);
  if (!resourceQuota || !resourceQuota.consumed || !resourceQuota.limit) {
    return 0;
  }
  return (resourceQuota.consumed / resourceQuota.limit) * 100;
}

const getQuota = (
  group: ServiceGroup,
  resource: string
): QuotaResources | undefined =>
  findNestedPropertyInObject(group.quota, resource);

export const ServiceGroup = {
  getQuota,
  getQuotaPercentage
};
