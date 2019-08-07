//@ts-ignore
import { request } from "@dcos/mesos-client";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
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

export function updateQuota(
  groupId: string,
  quotaData: QuotaData
): Observable<string> {
  const updateQuotaReq: UpdateQuotaRequest = {
    type: "UPDATE_QUOTA",
    update_quota: makeUpdateQuota(groupId, quotaData)
  };
  return request(updateQuotaReq).pipe(
    map((response: string) => {
      if (response === "") {
        return "SUCCESS";
      }
      throw new Error(response);
    })
  );
}
