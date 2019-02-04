import Config from "#SRC/js/config/Config";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";

import { of, timer } from "rxjs";
import {
  catchError,
  map,
  exhaustMap,
  publishReplay,
  refCount
} from "rxjs/operators";
import { request } from "@dcos/http-service";

function fetchUnit(unitID) {
  const unitUrl = `${Config.rootUrl}${
    Config.unitHealthAPIPrefix
  }/units/${unitID}/nodes`;

  return request(unitUrl).pipe(
    map(({ response }) => response.nodes),
    catchError(_err => of([]))
  );
}

function pollStream(interval, stream) {
  return timer(0, interval).pipe(exhaustMap(() => stream));
}

export function replayStream(stream) {
  return stream.pipe(
    publishReplay(1),
    refCount()
  );
}

function withHealthDescription(masters) {
  return masters.map(master =>
    Object.assign({}, master, {
      healthDescription: UnitHealthUtil.getHealth(parseInt(master.health, 10))
    })
  );
}

export function mesosMastersHealthQuery(source, interval) {
  const request$ = source().pipe(map(withHealthDescription));

  return replayStream(pollStream(interval, request$));
}

const HEALTH_POLL_INTERVAL = 30000;
export function mesosMastersHealth() {
  return mesosMastersHealthQuery(
    () => fetchUnit("dcos-mesos-master.service"),
    HEALTH_POLL_INTERVAL
  );
}
