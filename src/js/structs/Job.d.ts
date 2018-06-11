import Item from "./Item";
import JobRunList from "./JobRunList";

export default class Job extends Item {
  getActiveRuns(): JobRunList;
  getCommand(): string;
  getCpus(): Number;
  getDescription(): string;
  getDocker(): string;
  getDisk(): Number;
  getId(): string;
  getJobRuns(): JobRunList;
  getLabels(): object;
  getMem(): Number;
  getLastRunsSummary(): object;
  getLastRunStatus(): object;
  getName(): string;
  getSchedules(): string[];
  getScheduleStatus(): string;
  toJSON(): object;
}
