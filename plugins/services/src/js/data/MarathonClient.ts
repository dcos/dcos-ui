import { request } from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

function buildMarathonURI(path: string) {
  return `${Config.rootUrl}${Config.marathonAPIPrefix}${path}`;
}

interface CreateGroupErrorResponse {
  message: string;
  details?: Array<{ path: string; errors: string[] }>;
}

export interface CreateGroupResponse {
  deploymentId: string;
  version: string;
}

export function createGroup(
  id: string,
  enforceRole: boolean
): Observable<CreateGroupResponse> {
  return request(buildMarathonURI("/groups"), {
    method: "POST",
    body: JSON.stringify({ id, enforceRole })
  }).pipe(
    map(reqResp => {
      const { code } = reqResp;
      if (code > 300) {
        const response = (reqResp.response || {
          message: "Unknown"
        }) as CreateGroupErrorResponse;
        let message: string;
        switch (reqResp.code) {
          case 409:
            message = "Conflict - Group";
            break;
          case 403:
            message = "Forbidden - Group";
            break;
          default:
            message = response.message;
            break;
        }

        throw new Error(message);
      }
      return reqResp.response as CreateGroupResponse;
    })
  );
}

export function editGroup(
  id: string,
  enforceRole: boolean
): Observable<CreateGroupResponse> {
  return request(buildMarathonURI("/groups/" + id), {
    method: "PUT",
    body: JSON.stringify({ id, enforceRole })
  }).pipe(
    map(reqResp => {
      const { code } = reqResp;
      if (code > 300) {
        const response = (reqResp.response || {
          message: "Unknown"
        }) as CreateGroupErrorResponse;
        let message: string;
        switch (reqResp.code) {
          case 409:
            message = "Conflict - Group";
            break;
          case 403:
            message = "Forbidden - Group";
            break;
          default:
            message = response.message;
            break;
        }

        throw new Error(message);
      }
      return reqResp.response as CreateGroupResponse;
    })
  );
}
