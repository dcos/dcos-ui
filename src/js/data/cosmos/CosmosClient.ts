import { tap } from "rxjs/operators";
import { request, RequestResponse } from "@dcos/http-service";

interface PackageVersionsResponse {
  results: Record<string, string>;
}

export const CosmosClient = (rootUrl: string) => ({
  listPackageVersions: (packageName: string) =>
    request<PackageVersionsResponse>(`${rootUrl || "/"}package/list-versions`, {
      method: "POST",
      body: JSON.stringify({
        includePackageVersions: true,
        packageName,
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
        ),
      },
    }).pipe(
      tap((requestResponse) => {
        if (requestResponse.code >= 300) {
          throw new Error(getErrorMessage(requestResponse));
        }
      })
    ),
});

export function buildRequestHeader(
  action: string,
  actionType: string,
  entity: string,
  version: string
) {
  return `application/vnd.dcos.${entity}.${action}-${actionType}+json;charset=utf-8;version=${version}`;
}

export function getErrorMessage({
  response,
  message,
}: RequestResponse<any>): string {
  if (typeof response === "string") {
    return response;
  }
  if (typeof response === "object") {
    if (response.description) {
      return response.description;
    }
    if (response.message) {
      return response.message;
    }
  }
  if (message) {
    return message;
  }

  return "An error has occurred.";
}
