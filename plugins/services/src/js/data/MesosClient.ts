import { request } from "@dcos/mesos-client";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { QuotaData, quotaFields } from "../types/Quota";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

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
  for (let field of quotaFields) {
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

export class UpdateQuotaError extends Error {
  readonly responseCode: number;
  constructor(message: string, code: number = 0) {
    super(message);
    this.name = "UpdateQuotaError";
    this.responseCode = code;
  }
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
      }
      throw new UpdateQuotaError(response);
    }),
    catchError(resp => {
      throw new UpdateQuotaError(resp.response || resp.message, resp.code);
    })
  );
}
