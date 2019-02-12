import { map } from "rxjs/operators";
import { request } from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import { buildRequestHeader, getErrorMessage } from "./utils";

import { PackageVersionsResponse } from "../";

export { CosmosClient };

const CosmosClient = {
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
      map(requestResponse => {
        if (requestResponse.code < 300) return requestResponse;

        throw new Error(getErrorMessage(requestResponse));
      })
    )
};
