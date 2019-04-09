import Item from "#SRC/js/structs/Item";
import ServiceStatus from "#PLUGINS/services/src/js/structs/ServiceStatus";

export default class Service extends Item {
  getId(): string;
  getMesosId(): string;
  getName(): string;
  getSpec(): any;
  getHealth(): string;
  getLabels(): object;
  getVolumes(): any;
  getStatus(): any;
  getServiceStatus(): ServiceStatus;
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
