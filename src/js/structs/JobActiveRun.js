import moment from 'moment';

import Item from './Item';
import JobTaskList from './JobTaskList';

module.exports = class JobActiveRun extends Item {
  getDateCreated() {
    let dateCreated = this.get('createdAt');

    if (dateCreated != null) {
      return moment(dateCreated.toUpperCase());
    }

    return null;
  }

  getJobID() {
    return this.get('jobId');
  }

  getStatus() {
    return this.get('status');
  }

  getTasks() {
    return new JobTaskList({items: this.get('tasks')});
  }
};
