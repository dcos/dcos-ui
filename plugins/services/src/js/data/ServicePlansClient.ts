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
  status: ServicePlanStatus;
  name: string;
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
  name: string;
  phases: ServicePlanPhaseResponse[];
  status: ServicePlanStatus;
  errors: string[];
  strategy: string;
}

export function fetchPlans(
  serviceName: string
): Observable<RequestResponse<string[]>> {
  return request(`/service/${serviceName}/v1/plans`);
}

export function fetchPlanDetails(
  serviceName: string,
  planName: string
): Observable<RequestResponse<ServicePlanResponse>> {
  return request(`/service/${serviceName}/v1/plans/${planName}`);
}
