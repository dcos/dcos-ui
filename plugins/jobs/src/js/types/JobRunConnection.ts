import {
  JobRun,
  JobRunTypeResolver,
  JobRunSchema,
  isActiveJobRun
} from "#PLUGINS/jobs/src/js/types/JobRun";
import * as MetronomeClient from "#SRC/js/events/MetronomeClient";
import { JobHistoryRun } from "#PLUGINS/jobs/src/js/types/JobHistoryRun";
import DateUtil from "#SRC/js/utils/DateUtil";

export interface JobRunConnection {
  longestRunningActiveRun: JobRun | null;
  nodes: JobRun[];
}

export const JobRunConnectionSchema = `
${JobRunSchema}
type JobRunConnection {
  longestRunningActiveRun: JobRun
  nodes: [JobRun]!
}
`;

export function JobRunConnectionTypeResolver(
  runs: Array<MetronomeClient.ActiveJobRun | JobHistoryRun>
): JobRunConnection {
  return {
    longestRunningActiveRun: JobRunConnectionFieldResolvers.longestRunningActiveRun(
      runs
    ),
    nodes: JobRunConnectionFieldResolvers.nodes(runs)
  };
}

export const JobRunConnectionFieldResolvers = {
  longestRunningActiveRun(
    runs: Array<MetronomeClient.ActiveJobRun | JobHistoryRun>
  ): JobRun | null {
    const activeRuns = runs.filter(run => isActiveJobRun(run));
    if (!activeRuns.length) {
      return null;
    }

    const sortedRuns = activeRuns.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) {
        return 0;
      }

      if (!a.createdAt) {
        return 1;
      }

      if (!b.createdAt) {
        return -1;
      }

      return DateUtil.strToMs(a.createdAt) - DateUtil.strToMs(b.createdAt);
    });

    return JobRunTypeResolver(sortedRuns[0]);
  },
  nodes(runs: Array<MetronomeClient.ActiveJobRun | JobHistoryRun>): JobRun[] {
    return runs.map(run => JobRunTypeResolver(run));
  }
};
