import Service from "./Service";

export default class Pod extends Service {
  getRunningInstancesCount(): number;
  countNonTerminalInstances(): number;
  getServiceStatus(): string;
  getSpec(): any;
  getTasksSummary(): object;
  getTerminationHistoryList(): any;
  findInstanceByTaskId(taskId: number): any;
  getVersion(): string;
  getVolumesData(): any;
  getRegions(): any;
}
