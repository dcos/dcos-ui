import { request, RequestResponse } from "@dcos/http-service";
import { Observable } from "rxjs";

export interface PackageVersionsResults {
  [key: string]: string;
}

export interface PackageVersionsResponse {
  results: PackageVersionsResults;
}

export function fetchPackageVersions(
  packageName: string
): Observable<RequestResponse<PackageVersionsResponse>> {
  return request("/package/list-versions", {
    method: "POST",
    body: {
      includePackageVersions: true,
      packageName
    },
    headers: {
      accept:
        "application/vnd.dcos.package.list-versions-response+json;charset=utf-8;version=v1",
      "content-type":
        "application/vnd.dcos.package.list-versions-request+json;charset=utf-8;version=v1"
    }
  });
}
