import { request, RequestResponse } from "@dcos/http-service";
import { Observable } from "rxjs/Observable";

export type ServicePlanStatus =
  | "ERROR"
  | "WAITING"
  | "PENDING"
  | "PREPARED"
  | "STARTING"
  | "STARTED"
  | "COMPLETE"
  | "IN_PROGRESS";

export interface ServicePlanStepResponse {
  id: string;
  name: string;
  status: ServicePlanStatus;
  message: string;
}

export interface ServicePlanPhaseResponse {
  id: string;
  name: string;
  steps: ServicePlanStepResponse[];
  strategy: string;
  status: ServicePlanStatus;
}

export interface ServicePlanResponse {
  phases: ServicePlanPhaseResponse[];
  status: ServicePlanStatus;
  errors: string[];
  strategy: string;
}

export function fetchPlans(
  serviceId: string
): Observable<RequestResponse<string[]>> {
  return request(`/service/${serviceId}/v1/plans`).map(
    (reqResp: RequestResponse<any>) => {
      if (reqResp.code >= 300) {
        const respMessage =
          reqResp.response && typeof reqResp.response === "object"
            ? JSON.stringify(reqResp.response)
            : reqResp.response;
        throw new Error(
          `Service Plans API request failed: ${reqResp.code} ${
            reqResp.message
          }:${respMessage}`
        );
      }
      return reqResp;
    }
  );
}

export function fetchPlanDetails(
  serviceId: string,
  planName: string
): Observable<RequestResponse<ServicePlanResponse>> {
  return request(`/service/${serviceId}/v1/plans/${planName}`).map(
    (reqResp: RequestResponse<any>) => {
      if (reqResp.code >= 300) {
        const respMessage =
          reqResp.response && typeof reqResp.response === "object"
            ? JSON.stringify(reqResp.response)
            : reqResp.response;
        throw new Error(
          `Service Plan Detail API request failed: ${reqResp.code} ${
            reqResp.message
          }:${respMessage}`
        );
      }
      return reqResp;
    }
  );
}
