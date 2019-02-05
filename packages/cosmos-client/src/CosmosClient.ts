import { request, RequestResponse } from "@dcos/http-service";
import { Observable } from "rxjs";
import { buildRequestHeader } from "./utils";

export interface ListVersionsResults {
  [key: string]: string;
}

export interface PackageVersionsResponse {
  results: ListVersionsResults;
}

export class CosmosClient {
  readonly rootUrl: string;
  readonly apiPrefix: string;

  constructor(rootUrl: string, cosmosAPIPrefix: string) {
    this.rootUrl = rootUrl;
    this.apiPrefix = cosmosAPIPrefix;
  }

  listPackageVersions(
    packageName: string
  ): Observable<RequestResponse<PackageVersionsResponse>> {
    return request(`${this.rootUrl}${this.apiPrefix}/list-versions`, {
      method: "POST",
      body: {
        includePackageVersions: true,
        packageName
      },
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
    });
  }
}
