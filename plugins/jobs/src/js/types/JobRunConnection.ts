import {
  JobRun,
  JobRunTypeResolver,
  JobRunSchema,
  isActiveJobRun,
} from "#PLUGINS/jobs/src/js/types/JobRun";
import { ActiveJobRun as MetronomeActiveJobRun } from "#SRC/js/events/MetronomeClient";
import { HistoricJobRun } from "#PLUGINS/jobs/src/js/types/HistoricJobRun";
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
  runs: Array<MetronomeActiveJobRun | HistoricJobRun>
): JobRunConnection {
  return {
    longestRunningActiveRun: longestRunningActiveRun(runs),
    nodes: runs.map((run) => JobRunTypeResolver(run)),
  };
}

const longestRunningActiveRun = (
  runs: Array<MetronomeActiveJobRun | HistoricJobRun>
): JobRun | null => {
  const activeRuns = runs.filter((run) => isActiveJobRun(run));
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
};
