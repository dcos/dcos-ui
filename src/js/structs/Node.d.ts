import Item from "./Item";

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
  getResources: () => any;
  isPublic: () => boolean;
  getIp: () => string;
}
