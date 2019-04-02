import Item from "#SRC/js/structs/Item";

export default class Service extends Item {
  getId(): number;
  getMesosId(): string;
  getName(): string;
  getSpec(): any;
  getHealth(): string;
  getLabels(): object;
  getVolumes(): any;
  getStatus(): any;
  getServiceStatus(): any;
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
