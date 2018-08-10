import Config from "#SRC/js/config/Config";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";

import { Observable } from "rxjs";
import { request } from "@dcos/http-service";
import "rxjs/add/observable/of";
import "rxjs/add/observable/timer";

import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "rxjs/add/operator/exhaustMap";
import "rxjs/add/operator/publishReplay";

function fetchUnit(unitID) {
  const unitUrl = `${Config.rootUrl}${
    Config.unitHealthAPIPrefix
  }/units/${unitID}/nodes`;

  return request(unitUrl)
    .map(response => response.nodes)
    .catch(_err => Observable.of([]));
}

function pollStream(interval, stream) {
  return Observable.timer(0, interval).exhaustMap(() => stream);
}

export function replayStream(stream) {
  return stream.publishReplay(1).refCount();
}

function withHealthDescription(masters) {
  return masters.map(master =>
    Object.assign({}, master, {
      healthDescription: UnitHealthUtil.getHealth(parseInt(master.health, 10))
    })
  );
}

export function mesosMastersHealthQuery(source, interval) {
  const request$ = source().map(withHealthDescription);

  return replayStream(pollStream(interval, request$));
}

const HEALTH_POLL_INTERVAL = 30000;
export function mesosMastersHealth() {
  return mesosMastersHealthQuery(
    () => fetchUnit("dcos-mesos-master.service"),
    HEALTH_POLL_INTERVAL
  );
}
