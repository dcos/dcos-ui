import moment from 'moment';

import Item from './Item';
import JobTaskList from './JobTaskList';

module.exports = class JobActiveRun extends Item {
  getDateCreated() {
    return moment(this.get('createdAt'));
  }

  getJobID() {
    return this.get('jobId');
  }

  getLongestRunningTask() {
    let sortedTasks = this.getTasks().getItems().sort(function (a, b) {
      if (a.getDateStarted() === null && b.getDateStarted() === null) {
        return 0;
      }

      if (a.getDateStarted() === null) {
        return -1;
      }

      if (b.getDateStarted() === null) {
        return 1;
      }

      return a.getDateStarted().valueOf() -  b.getDateStarted().valueOf();
    })

    return sortedTasks[0];
  }

  getStatus() {
    return this.get('status');
  }

  getTasks() {
    return new JobTaskList({items: this.get('tasks')});
  }
};
