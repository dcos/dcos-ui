import Service from "./Service";
import { StatusCategories } from "#SRC/js/constants/StatusIcon";
import List from "#SRC/js/structs/List";
import Tree from "#SRC/js/structs/Tree";
import { StatusCategory } from "../constants/ServiceStatus";

interface ServiceTreeStatusSummary {
  status: StatusCategory;
  counts: {
    total: number;
    status: Record<StatusCategory, number>;
  };
}

declare class ServiceTree extends Tree<Service> {
  constructor(options = {});
  getDeployments(): object[] | null;
  getQueue(): null;
  getRegions(): any[];
  getHealth(): any;
  getId(): string;
  getEnforceRole(): boolean | undefined;
  getServiceFromTaskID(taskID: number): any;
  getTaskFromTaskID(taskID: any): any;
  getItemParent(id: any, parent: any): any;
  findItemById(id: any): any;
  filterItemsByFilter(filter: string): any;
  filterItems(callback: (a: Service) => boolean): Tree<Service>;
  getInstancesCount(): number;
  getName(): string;
  getResources(): object;
  getStatus(): string | null;
  getServiceTreeStatusSummary(): ServiceTreeStatusSummary;
  getStatusCategoryCounts(): {
    status: Record<StatusCategory, number>;
    total: number;
  };
  getServiceStatus(): Status | null;
  getServices(): List;
  getGroups(): List;
  getTasksSummary(): any;
  getRunningInstancesCount(): number;
  getFrameworks(): any;
  getVolumes(): any;
  getLabels(): any;
}

export { ServiceTree as default, ServiceTreeStatusSummary };
