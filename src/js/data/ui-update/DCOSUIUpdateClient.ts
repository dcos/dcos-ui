import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { request, RequestResponse } from "@dcos/http-service";

export interface UIVersionResponse {
  default: boolean;
  packageVersion: string;
  buildVersion: string;
}

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

export function getErrorMessage(reqResp: RequestResponse<any>): string {
  const { response, message } = reqResp;
  if (typeof response === "string") {
    return response;
  }
  if (message) {
    return message;
  }
  return "An error occurred.";
}

export function handleBadResponses(requestResponse: RequestResponse<any>) {
  if (requestResponse.code >= 300) {
    throw new Error(getErrorMessage(requestResponse));
  }
}
