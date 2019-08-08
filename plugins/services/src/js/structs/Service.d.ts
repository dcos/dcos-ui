import Item from "#SRC/js/structs/Item";
import { Status } from "#PLUGINS/services/src/js/constants/ServiceStatus";

interface QuotaRolesStats {
  servicesCount: number;
  rolesCount: number;
  groupRolesCount: number;
}

export default class Service extends Item {
  getId(): string;
  getMesosId(): string;
  getName(): string;
  getRole(): string;
  getQuotaRoleStats(roleName: string | null = null): QuotaRolesStats;
  getSpec(): any;
  getHealth(): string;
  getLabels(): object;
  getVolumes(): any;
  getStatus(): any;
  getServiceStatus(): Status;
  getRegions(): any;
  getImages(): any;
  getQueue(): null;
  getWebURL(): null;
  getVersion(): string;
  getInstancesCount(): number;
  getRunningInstancesCount(): number;
  getTasksSummary(): object;
  getResources(): any;
  toJSON(): any;
}
