import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { request, RequestResponse } from "@dcos/http-service";

import { handleBadResponses } from "./utils";

import { UIVersionResponse } from "../";

export const DCOSUIUpdateClient = {
  fetchVersion: (
    rootUrl: string = "/"
  ): Observable<RequestResponse<UIVersionResponse>> => {
    return request<UIVersionResponse>(
      `${rootUrl}dcos-ui-update-service/api/v1/version/`
    ).pipe(tap(handleBadResponses));
  },
  updateUIVersion: (
    newPackageVersion: string,
    rootUrl: string = "/"
  ): Observable<RequestResponse<string>> => {
    return request<string>(
      `${rootUrl}dcos-ui-update-service/api/v1/update/${newPackageVersion}/`,
      {
        method: "POST"
      }
    ).pipe(tap(handleBadResponses));
  },
  resetUIVersion: (
    rootUrl: string = "/"
  ): Observable<RequestResponse<string>> => {
    return request<string>(`${rootUrl}dcos-ui-update-service/api/v1/reset/`, {
      method: "DELETE"
    }).pipe(tap(handleBadResponses));
  }
};
