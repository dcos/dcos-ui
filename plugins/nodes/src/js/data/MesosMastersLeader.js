import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/timer";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/retry";
import "rxjs/add/operator/filter";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

const STORE_POLL_INTERVAL = 2000;

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function hostPort(address) {
  return `${address.hostname}:${address.port}`;
}

export function getRegion(master) {
  return (
    findNestedPropertyInObject(master, "domain.fault_domain.region.name") ||
    "N/A"
  );
}

export function mesosMasterLeaderQuery(
  masterDataSource,
  interval = STORE_POLL_INTERVAL
) {
  return Observable.timer(0, interval)
    .map(_ => {
      return masterDataSource();
    })
    .map(mesosState => mesosState.master_info)
    .filter(master => !isEmptyObject(master))
    .map(master => {
      return {
        hostPort: hostPort(master.address),
        hostIp: findNestedPropertyInObject(master, "address.ip"),
        version: master.version,
        electedTime: master.elected_time,
        startTime: master.start_time,
        region: getRegion(master)
      };
    });
}

const masterDataSource = MesosStateStore.getMaster.bind(MesosStateStore);
export function mesosMastersLeader() {
  return mesosMasterLeaderQuery(masterDataSource, STORE_POLL_INTERVAL);
}
