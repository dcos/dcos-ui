import Item from "./Item";
import { Status } from "#PLUGINS/nodes/src/js/types/Status";

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
  getStatus: () => Status;
  sumTaskTypesByState: (state: any) => any;
  getResources: () => any;
  isPublic: () => boolean;
  getIp: () => string;
  getPublicIps: () => string[];
}
