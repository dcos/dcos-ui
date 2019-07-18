import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

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

export type ServiceGroupQuotaLimit =
  | "Enforced"
  | "Not Enforced"
  | "Partially Enforced"
  | "N/A";

export type ServiceGroupQuota = {
  enforced: boolean;
  limitStatus: ServiceGroupQuotaLimit;
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
