import List from "./List";
import JobTask from "./JobTask";

export default class JobTaskList extends List<JobTask> {
  static type = JobTask;
  getLongestRunningTask() {
    const sortedTasks = this.getItems().sort((a, b) => {
      if (a.getDateStarted() == null && b.getDateStarted() == null) {
        return 0;
      }

      if (a.getDateStarted() == null) {
        return 1;
      }

      if (b.getDateStarted() == null) {
        return -1;
      }

      return a.getDateStarted() - b.getDateStarted();
    });

    return sortedTasks[0];
  }
}
