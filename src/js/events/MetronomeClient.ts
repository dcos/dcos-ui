import { request, RequestResponse } from "@dcos/http-service";
// TODO: remove this disable with https://jira.mesosphere.com/browse/DCOS_OSS-3579
// tslint:disable-next-line:no-submodule-imports
import { Observable } from "rxjs/Observable";
import Config from "../config/Config";

// Add interface information: https://jira.mesosphere.com/browse/DCOS-37725

export interface GenericJobResponse {
  id: string;
  labels: LabelResponse;
  activeRuns?: ActiveJobRun[];
  run: {
    cpus: number;
    mem: number;
    disk: number;
    cmd: string;
    env: object;
    placement: {
      constraints: any[];
    };
    artifacts: any[];
    maxLaunchDelay: number;
    volumes: any[];
    restart: {
      policy: string;
    };
    docker?: JobDocker;
    secrets: object;
  };
  schedules: Schedule[];
}

export interface JobResponse extends GenericJobResponse {
  historySummary: JobHistorySummary;
}

export interface JobDetailResponse extends GenericJobResponse {
  description: string;
  activeRuns: ActiveJobRun[];
  history: JobHistory;
}

interface LabelResponse {
  [key: string]: string;
}

export interface JobLabels {
  key: string;
  value: string;
}

export interface JobDocker {
  secrets: object;
  forcePullImage: boolean;
  image: string;
}

export interface Schedule {
  concurrencyPolicy: string;
  cron: string;
  enabled: boolean;
  id: string;
  nextRunAt: string;
  startingDeadlineSeconds: number;
  timezone: string;
}

export type JobStatus =
  | "ACTIVE"
  | "FAILED"
  | "INITIAL"
  | "RUNNING"
  | "STARTING"
  | "COMPLETED";

export interface ActiveJobRun {
  completedAt?: string | null;
  createdAt: string;
  id: string;
  jobId: string;
  status: JobStatus;
  tasks: JobRunTask[];
}

export interface JobRunTask {
  id: string;
  createdAt: string;
  finishedAt: string | null;
  status: JobTaskStatus;
}

export type JobTaskStatus =
  | "TASK_CREATED"
  | "TASK_DROPPED"
  | "TASK_ERROR"
  | "TASK_FAILED"
  | "TASK_FINISHED"
  | "TASK_GONE"
  | "TASK_GONE_BY_OPERATOR"
  | "TASK_KILLED"
  | "TASK_KILLING"
  | "TASK_LOST"
  | "TASK_RUNNING"
  | "TASK_STAGING"
  | "TASK_STARTED"
  | "TASK_STARTING"
  | "TASK_UNKNOWN"
  | "TASK_UNREACHABLE";

export interface JobHistorySummary {
  successCount: number;
  failureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
}

export interface JobHistory extends JobHistorySummary {
  successfulFinishedRuns: JobHistoryRun[];
  failedFinishedRuns: JobHistoryRun[];
}

export interface JobHistoryRun {
  id: string;
  createdAt: string;
  finishedAt: string;
}

export interface JobData {
  id: string;
}

export interface ScheduleData {
  id: string;
}

export function isDetailResponse(
  response: GenericJobResponse
): response is JobDetailResponse {
  return (response as JobDetailResponse).history !== undefined;
}

const defaultHeaders = {
  "Content-Type": "application/json; charset=utf-8"
};

export function createJob(
  data: JobDetailResponse
): Observable<RequestResponse<JobDetailResponse>> {
  return request(`${Config.metronomeAPI}/v0/scheduled-jobs`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: defaultHeaders
  });
}

export function fetchJobs(): Observable<RequestResponse<JobResponse[]>> {
  return request(
    `${
      Config.metronomeAPI
    }/v1/jobs?embed=activeRuns&embed=schedules&embed=historySummary`,
    { headers: defaultHeaders }
  );
}

export function fetchJobDetail(
  jobID: string
): Observable<RequestResponse<JobDetailResponse>> {
  return request(
    `${
      Config.metronomeAPI
    }/v1/jobs/${jobID}?embed=activeRuns&embed=history&embed=schedules`,
    { headers: defaultHeaders }
  );
}

export function deleteJob(
  jobID: string,
  stopCurrentJobRuns = false
): Observable<RequestResponse<any>> {
  return request(
    `${
      Config.metronomeAPI
    }/v1/jobs/${jobID}?stopCurrentJobRuns=${stopCurrentJobRuns}`,
    { method: "DELETE", headers: defaultHeaders }
  );
}

export function updateJob(
  jobID: string,
  data: JobDetailResponse
): Observable<RequestResponse<JobDetailResponse>> {
  return request(
    `${
      Config.metronomeAPI
    }/v0/scheduled-jobs/${jobID}?embed=activeRuns&embed=history&embed=schedules`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: defaultHeaders
    }
  );
}

export function runJob(jobID: string): Observable<RequestResponse<any>> {
  return request(
    `${
      Config.metronomeAPI
    }/v1/jobs/${jobID}/runs?embed=activeRuns&embed=history&embed=schedules`,
    {
      headers: defaultHeaders,
      method: "POST",
      body: "{}"
    }
  );
}

export function stopJobRun(
  jobID: string,
  jobRunID: string
): Observable<RequestResponse<any>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs/${jobID}/runs/${jobRunID}/actions/stop`,
    { headers: defaultHeaders, method: "POST", body: "{}" }
  );
}

export function updateSchedule(
  jobID: string,
  data: ScheduleData
): Observable<RequestResponse<any>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs/${jobID}/schedules/${data.id}`,
    { method: "PUT", headers: defaultHeaders, body: JSON.stringify(data) }
  );
}
