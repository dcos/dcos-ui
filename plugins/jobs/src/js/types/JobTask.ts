import {
  JobRunTask as MetronomeJobRunTask,
  JobTaskStatus as MetronomeJobTaskStatus
} from "#SRC/js/events/MetronomeClient";
import DateUtil from "#SRC/js/utils/DateUtil";
import {
  JobTaskStatus,
  JobTaskStatusSchema
} from "#PLUGINS/jobs/src/js/types/JobTaskStatus";

export interface JobTask {
  dateCompleted: number | null;
  dateStarted: number;
  status: MetronomeJobTaskStatus;
  taskId: string;
}

export const JobTaskSchema = `
${JobTaskStatusSchema}
type JobTask {
  dateCompleted: Int!
  dateStarted: Int!
  status: JobTaskStatus!
  taskId: String!
}
`;

export function JobTaskTypeResolver(task: MetronomeJobRunTask): JobTask {
  return {
    dateStarted: JobTaskFieldResolvers.dateStarted(task),
    dateCompleted: JobTaskFieldResolvers.dateCompleted(task),
    status: JobTaskFieldResolvers.status(task),
    taskId: task.id
  };
}

export const JobTaskFieldResolvers = {
  dateStarted(task: MetronomeJobRunTask): number {
    return DateUtil.strToMs(task.createdAt);
  },
  dateCompleted(task: MetronomeJobRunTask): number | null {
    return task.finishedAt ? DateUtil.strToMs(task.finishedAt) : null;
  },
  status(task: MetronomeJobRunTask): JobTaskStatus {
    return task.status;
  },
  taskId(task: MetronomeJobRunTask): string {
    return task.id;
  }
};
