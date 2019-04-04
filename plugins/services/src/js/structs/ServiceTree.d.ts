import Service from "./Service";
import StatusIcon from "#SRC/js/constants/StatusIcon";
import Tree from "#SRC/js/structs/Tree";
import { Status } from "../constants/ServiceStatus";

interface ServiceTreeStatusSummary {
  status: string;
  statusCounts: Record<string, number>;
  countsText: string;
  values: {
    priorityStatusCount: number;
    totalCount: number;
  };
}

declare class ServiceTree extends Tree<Service> {
  getDeployments(): object[] | null;
  getQueue(): null;
  getRegions(): any[];
  getHealth(): any;
  getId(): string;
  getServiceFromTaskID(taskID: number): any;
  getTaskFromTaskID(taskID: any): any;
  getItemParent(id: any, parent: any): any;
  findItemById(id: any): any;
  filterItemsByFilter(filter: string): any;
  filterItems(callback: (a: Service) => boolean): Tree<Service>;
  getInstancesCount(): number;
  getName(): string;
  getResources(): object;
  getStatus(): string | ServiceTreeStatusSummary | null;
  getStatusIconCounts(): { status: Record<string, number>; total: number };
  getServiceStatus(): Status | null;
  getServices(): any;
  getTasksSummary(): any;
  getRunningInstancesCount(): number;
  getFrameworks(): any;
  getVolumes(): any;
  getLabels(): any;
}

export { ServiceTree as default, ServiceTreeStatusSummary };
