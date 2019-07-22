import { request } from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import { map } from "rxjs/operators";

function buildMarathonURI(path: string) {
  return `${Config.rootUrl}${Config.marathonAPIPrefix}${path}`;
}

export function createGroup(id: string, enforceRole: boolean) {
  return request(buildMarathonURI("/groups"), {
    method: "POST",
    body: JSON.stringify({ id, enforceRole })
  }).pipe(
    map(reqResp => {
      const respMessage =
        reqResp.response && typeof reqResp.response === "object"
          ? JSON.stringify(reqResp.response)
          : reqResp.response;
      if (reqResp.code > 300) {
        let message: string;
        switch (reqResp.code) {
          case 409:
            message = "Conflict";
            break;
          case 403:
            message = "Forbidden";
            break;
          default:
            message = respMessage.toString();
            break;
        }

        throw new Error(message);
      }
      return reqResp.response;
    })
  );
}
