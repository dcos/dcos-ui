import * as MesosClient from "@dcos/mesos-client";
import {
  map,
  shareReplay,
  catchError,
  distinctUntilChanged,
} from "rxjs/operators";
import { Observable, of } from "rxjs";

import { retryWithLinearBackoff } from "../utils/rxjsUtils";
const { request } = MesosClient;

export const MesosMasterRequestType = Symbol("MesosMasterRequest");

export default request({ type: "GET_MASTER" }, "/mesos/api/v1?GET_MASTER").pipe(
  retryWithLinearBackoff(),
  shareReplay()
);

export function getMasterRegionName(
  response$: Observable<object>
): Observable<string> {
  return response$.pipe(
    map(
      (masterRequest) =>
        masterRequest?.get_master?.master_info?.domain?.fault_domain?.region
          ?.name || "N/A"
    ),
    catchError((err) => {
      console.error("Error getting the master region name", err);

      return of("N/A");
    }),
    distinctUntilChanged()
  );
}
