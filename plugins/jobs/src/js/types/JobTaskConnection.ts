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
  return {
    longestRunningTask: JobTaskConnectionFieldResolvers.longestRunningTask(
      tasks
    ),
    nodes: JobTaskConnectionFieldResolvers.nodes(tasks)
  };
}

export const JobTaskConnectionFieldResolvers = {
  longestRunningTask(tasks: MetronomeJobRunTask[]): JobTask | null {
    if (!tasks.length) {
      return null;
    }
    const parsedTasks = this.nodes(tasks);
    const sortedTasks = [...parsedTasks].sort(
      (a, b) => (a.dateStarted || Infinity) - (b.dateStarted || Infinity)
    );

    return sortedTasks[0];
  },
  nodes(tasks: MetronomeJobRunTask[]): JobTask[] {
    return tasks.map(task => JobTaskTypeResolver(task));
  }
};
