import { tap } from "rxjs/operators";
import { request } from "@dcos/http-service";

import { buildRequestHeader, getErrorMessage } from "./utils";

import { PackageVersionsResponse } from "../";

export const CosmosClient = (rootUrl: string) => ({
  listPackageVersions: (packageName: string) =>
    request<PackageVersionsResponse>(`${rootUrl || "/"}package/list-versions`, {
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
      tap(requestResponse => {
        if (requestResponse.code >= 300) {
          throw new Error(getErrorMessage(requestResponse));
        }
      })
    )
});
