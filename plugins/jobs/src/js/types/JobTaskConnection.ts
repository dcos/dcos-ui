import { JobRunTask as MetronomeJobRunTask } from "#SRC/js/events/MetronomeClient";
import {
  JobTask,
  JobTaskTypeResolver,
  JobTaskSchema
} from "#PLUGINS/jobs/src/js/types/JobTask";

export interface JobTaskConnection {
  longestRunningTask: JobTask | null;
  nodes: JobTask[];
}

export const JobTaskConnectionSchema = `
${JobTaskSchema}
type JobTaskConnection {
  longestRunningTask: JobTask
  nodes: [JobTask]!
}
`;

export function JobTaskConnectionTypeResolver(
  tasks: MetronomeJobRunTask[]
): JobTaskConnection {
  const nodes: JobTask[] = tasks.map(JobTaskTypeResolver);
  return {
    longestRunningTask:
      [...nodes].sort(
        (a, b) => (a.dateStarted || Infinity) - (b.dateStarted || Infinity)
      )[0] || null,
    nodes
  };
}
