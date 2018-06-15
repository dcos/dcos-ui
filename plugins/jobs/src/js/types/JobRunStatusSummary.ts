import * as MetronomeClient from "#SRC/js/events/MetronomeClient";
import { JobRunStatus } from "#PLUGINS/jobs/src/js/types/JobRunStatus";
import DateUtil from "#SRC/js/utils/DateUtil";
import { JobHistorySummaryTypeResolver } from "#PLUGINS/jobs/src/js/types/JobHistorySummary";

export interface JobRunStatusSummary {
  status: JobRunStatus;
  time: number | null;
}

export const JobRunStatusSummarySchema = `
type JobRunStatusSummary {
  status: JobRunStatus
  time: Int
}
`;

export function JobRunStatusSummaryTypeResolver(
  response: MetronomeClient.JobDetailResponse
): JobRunStatusSummary {
  const summary = JobHistorySummaryTypeResolver(response.history);
  let status = "N/A" as JobRunStatus;
  let time: string | null = null;
  let lastFailureAt = 0;
  let lastSuccessAt = 0;

  if (summary.lastFailureAt !== null) {
    lastFailureAt = DateUtil.strToMs(summary.lastFailureAt);
  }

  if (summary.lastSuccessAt !== null) {
    lastSuccessAt = DateUtil.strToMs(summary.lastSuccessAt);
  }

  if (summary.lastFailureAt !== null || summary.lastSuccessAt !== null) {
    if (lastFailureAt > lastSuccessAt) {
      status = "Failed" as JobRunStatus;
      time = summary.lastFailureAt;
    } else {
      status = "Success" as JobRunStatus;
      time = summary.lastSuccessAt;
    }
  }

  return { status, time: time ? DateUtil.strToMs(time) : null };
}

export const JobRunStatusSummaryFieldResolver = {
  status(response: MetronomeClient.JobDetailResponse): JobRunStatus {
    const summary = JobHistorySummaryTypeResolver(response.history);
    let status = "N/A" as JobRunStatus;
    let lastFailureAt = 0;
    let lastSuccessAt = 0;

    if (summary.lastFailureAt !== null) {
      lastFailureAt = DateUtil.strToMs(summary.lastFailureAt);
    }

    if (summary.lastSuccessAt !== null) {
      lastSuccessAt = DateUtil.strToMs(summary.lastSuccessAt);
    }

    if (summary.lastFailureAt !== null || summary.lastSuccessAt !== null) {
      status =
        lastFailureAt > lastSuccessAt
          ? ("Failed" as JobRunStatus)
          : ("Success" as JobRunStatus);
    }

    return status;
  },
  time(response: MetronomeClient.JobDetailResponse): number | null {
    const summary = JobHistorySummaryTypeResolver(response.history);
    let time: string | null = null;
    let lastFailureAt = 0;
    let lastSuccessAt = 0;

    if (summary.lastFailureAt !== null) {
      lastFailureAt = DateUtil.strToMs(summary.lastFailureAt);
    }

    if (summary.lastSuccessAt !== null) {
      lastSuccessAt = DateUtil.strToMs(summary.lastSuccessAt);
    }

    if (summary.lastFailureAt !== null || summary.lastSuccessAt !== null) {
      time =
        lastFailureAt > lastSuccessAt
          ? summary.lastFailureAt
          : summary.lastSuccessAt;
    }

    return time ? DateUtil.strToMs(time) : null;
  }
};
