import { RequestResponse } from "@dcos/http-service";

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
