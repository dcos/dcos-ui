import { JobHistorySummary as MetronomeJobHistorySummary } from "#SRC/js/events/MetronomeClient";
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
  history: MetronomeJobHistorySummary
): JobRunStatusSummary {
  const summary = JobHistorySummaryTypeResolver(history);
  if (summary.lastFailureAt === null && summary.lastSuccessAt === null) {
    return { status: "N/A", time: null };
  }

  const lastFailureAt = DateUtil.strToMs(summary.lastFailureAt) || 0;
  const lastSuccessAt = DateUtil.strToMs(summary.lastSuccessAt) || 0;
  return {
    status: lastSuccessAt >= lastFailureAt ? "Success" : "Failed",
    time: Math.max(lastFailureAt, lastSuccessAt)
  };
}
