import { RequestResponse } from "@dcos/http-service";

export function buildRequestHeader(
  action: string,
  actionType: number,
  entity: number,
  version: string
) {
  return `application/vnd.dcos.${entity}.${action}-${actionType}+json;charset=utf-8;version=${version}`;
}

export function getErrorMessage({
  response,
  message
}: RequestResponse<any>): string {
  if (typeof response === "string") {
    return response;
  } else if (typeof response === "object") {
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
