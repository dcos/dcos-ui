import { JobHistory as MetronomeJobHistory } from "#SRC/js/events/MetronomeClient";
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

export function JobHistorySummaryTypeResolver(
  history: MetronomeJobHistory
): JobHistorySummary {
  return {
    failureCount: JobHistorySummaryFieldResolvers.failureCount(history),
    lastFailureAt: JobHistorySummaryFieldResolvers.lastFailureAt(history),
    lastSuccessAt: JobHistorySummaryFieldResolvers.lastSuccessAt(history),
    successCount: JobHistorySummaryFieldResolvers.successCount(history)
  };
}

export const JobHistorySummaryFieldResolvers = {
  failureCount(history: MetronomeJobHistory): number {
    return history.failureCount;
  },
  lastFailureAt(history: MetronomeJobHistory): string | null {
    return history.lastFailureAt;
  },
  lastSuccessAt(history: MetronomeJobHistory): string | null {
    return history.lastSuccessAt;
  },
  successCount(history: MetronomeJobHistory): number {
    return history.successCount;
  }
};
