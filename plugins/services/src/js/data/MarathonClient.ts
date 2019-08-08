import {
  request,
  RequestResponse,
  RequestResponseError
} from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import { catchError, map } from "rxjs/operators";
import { Observable } from "rxjs";

import { GroupCreateError } from "./errors/GroupCreateError";
import { GroupEditError } from "./errors/GroupEditError";

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
  const createError = (
    resp:
      | RequestResponse<CreateGroupErrorResponse>
      | RequestResponseError<CreateGroupErrorResponse>
  ) => {
    const response = (resp.response || {
      message: "Unknown"
    }) as CreateGroupErrorResponse;
    let message: string;
    switch (resp.code) {
      case 409:
        message = "Conflict";
        break;
      case 403:
        message = "Forbidden";
        break;
      default:
        message = response.message;
        break;
    }
    return new GroupCreateError(message, resp.code);
  };
  return request(buildMarathonURI("/groups"), {
    method: "POST",
    body: JSON.stringify({ id, enforceRole })
  }).pipe(
    map(reqResp => {
      const { code } = reqResp;
      if (code > 300) {
        throw createError(reqResp as RequestResponse<CreateGroupErrorResponse>);
      }
      return reqResp.response as CreateGroupResponse;
    }),
    catchError(errResp => {
      throw createError(errResp);
    })
  );
}

export function editGroup(
  id: string,
  enforceRole: boolean
): Observable<CreateGroupResponse> {
  const createError = (
    resp:
      | RequestResponse<CreateGroupErrorResponse>
      | RequestResponseError<CreateGroupErrorResponse>
  ) => {
    const response = (resp.response || {
      message: "Unknown"
    }) as CreateGroupErrorResponse;
    let message: string;
    switch (resp.code) {
      case 403:
        message = "Forbidden";
        break;
      default:
        message = response.message;
        break;
    }
    return new GroupEditError(message, resp.code);
  };

  return request(buildMarathonURI(`/groups/${id}`), {
    method: "PUT",
    body: JSON.stringify({ enforceRole })
  }).pipe(
    map(reqResp => {
      const { code } = reqResp;
      if (code > 300) {
        throw createError(reqResp as RequestResponse<CreateGroupErrorResponse>);
      }
      return reqResp.response as CreateGroupResponse;
    }),
    catchError(errResp => {
      throw createError(errResp);
    })
  );
}
