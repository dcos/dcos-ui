import Item from "./Item";

export default class JobTask extends Item {
  getDateStarted(): string;
  getDateCompleted(): string;
  getTaskID(): string;
  getStatus(): string;
}
