import { map } from "rxjs/operators";
import { request, RequestResponse } from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import { buildRequestHeader, getErrorMessage } from "./utils";

import { PackageVersionsResponse } from "../";

export const CosmosClient = {
  listPackageVersions: (packageName: string) =>
    request<PackageVersionsResponse>(
      `${Config.rootUrl || "/"}package/list-versions`,
      {
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
      }
    ).pipe(
      map((reqResp: RequestResponse<PackageVersionsResponse>) => {
        if (reqResp.code < 300) {
          return reqResp;
        }
        throw new Error(getErrorMessage(reqResp));
      })
    )
};
