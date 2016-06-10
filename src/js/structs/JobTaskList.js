import List from './List';
import JobTask from './JobTask';

class JobTaskList extends List {
  getLongestRunningTask() {
    let sortedTasks = this.getItems().sort(function (a, b) {
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

JobTaskList.type = JobTask;

module.exports = JobTaskList;
