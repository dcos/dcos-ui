import DateUtil from '../utils/DateUtil';
import Item from './Item';
import JobTaskList from './JobTaskList';

module.exports = class JobActiveRun extends Item {
  getDateCreated() {
    return DateUtil.strToMs(this.get('createdAt'));
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
