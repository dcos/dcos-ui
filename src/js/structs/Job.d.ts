import Item from "./Item";
import JobRunList from "./JobRunList";

export default class Job extends Item {
  getActiveRuns(): JobRunList;
  getCommand(): string;
  getCpus(): number;
  getDescription(): string;
  getDocker(): string;
  getDisk(): number;
  getId(): string;
  getLabels(): object;
  getMem(): number;
  getName(): string;
  getSchedules(): string[];
  toJSON(): object;
}
