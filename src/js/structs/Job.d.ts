import Item from "./Item";

export default class Job extends Item {
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
