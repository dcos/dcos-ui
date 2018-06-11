import Item from "./Item";
import JobTaskList from "./JobTaskList";

export default class JobRun extends Item {
  getDateCreated(): string;
  getDateFinished(): string;
  getJobID(): Number;
  getStatus(): string;
  getTasks(): JobTaskList;
}
