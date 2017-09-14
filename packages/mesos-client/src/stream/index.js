import { stream as httpStream } from "http-service";

import parseRecordioRecords from "./parseRecordioRecords";

const TIMEOUT = 10000;

export default function stream(body, baseUrl = "") {
  const resource = httpStream(`${baseUrl}/mesos/api/v1`, {
    method: "POST",
    body: JSON.stringify(body),
    responseType: "text",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  })
    .timeout(TIMEOUT)
    .retry(-1);

  return parseRecordioRecords(resource);
}
