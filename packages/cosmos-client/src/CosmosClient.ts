import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { request, RequestResponse } from "@dcos/http-service";

import { buildRequestHeader, getErrorMessage } from "./utils";

import { PackageVersionsResponse } from "../";

export class CosmosClient {
  readonly rootUrl: string;

  constructor(rootUrl: string) {
    this.rootUrl = rootUrl;
  }

  listPackageVersions(
    packageName: string
  ): Observable<RequestResponse<PackageVersionsResponse>> {
    return request(`${this.rootUrl || "/"}package/list-versions`, {
      method: "POST",
      body: JSON.stringify({
        includePackageVersions: true,
        packageName
      }),
      headers: {
        Accept: buildRequestHeader(
          "list-versions",
          "response",
          "package",
          "v1"
        ),
        "Content-type": buildRequestHeader(
          "list-versions",
          "request",
          "package",
          "v1"
        )
      }
    }).pipe(
      map((reqResp: RequestResponse<any>) => {
        if (reqResp.code < 300) {
          return reqResp;
        }
        throw new Error(getErrorMessage(reqResp));
      })
    );
  }
}
