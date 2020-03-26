import {
  JobRunTask as MetronomeJobRunTask,
  JobTaskStatus as MetronomeJobTaskStatus,
} from "#SRC/js/events/MetronomeClient";
import DateUtil from "#SRC/js/utils/DateUtil";
import { JobTaskStatusSchema } from "#PLUGINS/jobs/src/js/types/JobTaskStatus";

export interface JobTask {
  dateCompleted: number | null;
  dateStarted: number | null;
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

export const JobTaskTypeResolver = (task: MetronomeJobRunTask): JobTask => ({
  dateStarted: DateUtil.strToMs(task.createdAt),
  dateCompleted: task.finishedAt ? DateUtil.strToMs(task.finishedAt) : null,
  status: task.status,
  taskId: task.id,
});
