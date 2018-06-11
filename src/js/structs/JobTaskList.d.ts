import List from "./List";
import JobTask from "./JobTask";

export default class JobTaskList extends List {
  getLongestRunningTask(): JobTask;
}
