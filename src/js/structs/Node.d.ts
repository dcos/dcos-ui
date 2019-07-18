import Item from "./Item";

export type DrainInfo =
  | {
      state: "DRAINING" | "DRAINED" | "UNKNOWN";
      config: {
        max_grace_period?: {
          nanoseconds: number;
        };
        mark_gone?: boolean;
      };
    }
  // to be backwards compatible with DCOS<=1.14
  | undefined;

export default class Node extends Item {
  getID: () => any;
  getServiceIDs: () => any;
  isActive: () => boolean;
  isDeactivated: () => boolean;
  getDomain: () => any;
  getRegionName: () => any;
  getZoneName: () => any;
  getUsageStats: (resource: any) => any;
  getHostName: () => any;
  getHealth: () => any;
  getOutput: () => any;
  getDrainInfo: () => DrainInfo;
  sumTaskTypesByState: (state: any) => any;
  getResources: () => any;
  isPublic: () => boolean;
  getIp: () => string;
  getPublicIps: () => string[];
}
