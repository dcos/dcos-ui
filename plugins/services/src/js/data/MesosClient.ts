import { request } from "@dcos/mesos-client";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
// @ts-ignore
import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

import { QuotaData, quotaFields } from "../types/Quota";
import { UpdateQuotaError } from "./errors/UpdateQuotaError";
import { OvercommitQuotaError } from "./errors/OvercommitQuotaError";

interface QuotaRequestValue {
  value: number;
}

interface QuotaConfig {
  role: string;
  guarantees?: Record<string, QuotaRequestValue>;
  limits?: Record<string, QuotaRequestValue>;
}

interface UpdateQuota {
  force?: boolean;
  quota_configs: QuotaConfig[];
}

interface UpdateQuotaRequest {
  type: "UPDATE_QUOTA";
  update_quota: UpdateQuota;
}

function roleFromGroupId(groupId: string): string {
  return groupId.split("/").pop() || groupId;
}

function limitsFromQuotaFormData(
  quotaData: QuotaData
): Record<string, QuotaRequestValue> {
  const result: Record<string, QuotaRequestValue> = {};
  for (const field of quotaFields) {
    const value = (quotaData[field] + "").trim();
    if (!ValidatorUtil.isEmpty(value)) {
      result[field] = {
        value: parseFloat(value)
      };
    }
  }
  return result;
}

function makeUpdateQuota(groupId: string, quotaData: QuotaData): UpdateQuota {
  return {
    force: quotaData.force,
    quota_configs: [
      {
        role: roleFromGroupId(groupId),
        limits: limitsFromQuotaFormData(quotaData)
      }
    ]
  };
}

export function updateQuota(
  groupId: string,
  quotaData: QuotaData
): Observable<string> {
  const updateQuotaReq: UpdateQuotaRequest = {
    type: "UPDATE_QUOTA",
    update_quota: makeUpdateQuota(groupId, quotaData)
  };
  return request(updateQuotaReq, "/mesos/api/v1?UPDATE_QUOTA").pipe(
    map((response: string) => {
      if (response === "") {
        return "SUCCESS";
      } else if (OvercommitQuotaError.isOvercommitError(response)) {
        throw new OvercommitQuotaError(response, 400);
      }
      throw new UpdateQuotaError(response);
    }),
    catchError(resp => {
      const message = resp.response || resp.message;
      if (OvercommitQuotaError.isOvercommitError(message)) {
        throw new OvercommitQuotaError(message, resp.code);
      }
      throw new UpdateQuotaError(message, resp.code);
    })
  );
}
