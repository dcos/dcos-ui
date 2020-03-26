import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { i18nMark } from "@lingui/react";
import { formatQuotaPercentageForDisplay } from "../utils/QuotaUtil";

export type QuotaResources = {
  guarantee?: number;
  limit?: number;
  effectiveLimit?: number;
  consumed?: number;
};

export type QuotaRolesStats = {
  count: number;
  groupRoleCount: number;
};

export const QuotaLimitStatuses: {
  applied: string;
  notApplied: string;
  partiallyApplied: string;
  na: string;
} = {
  applied: i18nMark("Applied"),
  notApplied: i18nMark("Not Applied"),
  partiallyApplied: i18nMark("Partially Applied"),
  na: i18nMark("N/A"),
};

export type ServiceGroupQuota = {
  enforced: boolean;
  limitStatus: string;
  serviceRoles?: QuotaRolesStats;
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
  return formatQuotaPercentageForDisplay(
    resourceQuota.consumed,
    resourceQuota.limit
  );
}

const getQuota = (
  group: ServiceGroup,
  resource: string
): QuotaResources | undefined =>
  findNestedPropertyInObject(group.quota, resource);

export const ServiceGroup = {
  getQuota,
  getQuotaPercentage,
};
