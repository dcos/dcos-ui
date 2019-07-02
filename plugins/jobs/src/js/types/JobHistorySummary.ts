import { JobHistorySummary as MetronomeJobHistorySummary } from "#SRC/js/events/MetronomeClient";
export interface JobHistorySummary {
  failureCount: number;
  lastFailureAt: string | null;
  lastSuccessAt: string | null;
  successCount: number;
}

export const JobHistorySummarySchema = `
type JobHistorySummary {
  failureCount: Int!
  lastFailureAt: String
  lastSuccessAt: String
  successCount: Int!
}
`;

export const JobHistorySummaryTypeResolver = (
  history: MetronomeJobHistorySummary
): JobHistorySummary => ({
  failureCount: history.failureCount,
  lastFailureAt: history.lastFailureAt,
  lastSuccessAt: history.lastSuccessAt,
  successCount: history.successCount
});
