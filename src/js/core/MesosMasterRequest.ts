// @ts-ignore
import * as MesosClient from "@dcos/mesos-client";
import {
  map,
  retryWhen,
  shareReplay,
  catchError,
  distinctUntilChanged
} from "rxjs/operators";
import { Observable, of } from "rxjs";

import { linearBackoff } from "../utils/rxjsUtils";
import Util from "#SRC/js/utils/Util";

const { request } = MesosClient;
const MAX_RETRIES = 5;
const RETRY_DELAY = 500;

export const MesosMasterRequestType = Symbol("MesosMasterRequest");

export default request({ type: "GET_MASTER" }, "/mesos/api/v1?GET_MASTER").pipe(
  retryWhen(linearBackoff(RETRY_DELAY, MAX_RETRIES)),
  shareReplay()
);

export function getMasterRegionName(
  response$: Observable<object>
): Observable<string> {
  return response$.pipe(
    map(
      masterRequest =>
        Util.findNestedPropertyInObject(
          masterRequest,
          "get_master.master_info.domain.fault_domain.region.name"
        ) || "N/A"
    ),
    catchError(err => {
      // tslint:disable-next-line
      console.error("Error getting the master region name", err);

      return of("N/A");
    }),
    distinctUntilChanged()
  );
}
