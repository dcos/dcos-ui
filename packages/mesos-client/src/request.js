import { request as httpRequest } from "http-service";

export default function request(body, baseUrl = "") {
  return httpRequest(`${baseUrl}/mesos/api/v1`, {
    method: "POST",
    body: JSON.stringify(body),
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
}
