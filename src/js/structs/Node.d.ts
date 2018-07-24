import Item from "./Item";

export enum AgentNodeStatus {
  HEALTHY = "HEALTHY",
  UNHEALTHY = "UNHEALTHY",
  UNKNOWN = "UNKNOWN"
}

export default class Node extends Item {
  getID: () => any;
  getServiceIDs: () => any;
  isActive: () => any;
  getDomain: () => any;
  getRegionName: () => any;
  getZoneName: () => any;
  getUsageStats: (resource: any) => any;
  getHostName: () => any;
  getHealth: () => any;
  getOutput: () => any;
  sumTaskTypesByState: (state: any) => any;
  getUsedResources: () => any;
  isPublic: () => boolean;
  getStatus: () => AgentNodeStatus;
}
