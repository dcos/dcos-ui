import List from './List';
import JobTask from './JobTask';

class JobTaskList extends List {}

JobTaskList.type = JobTask;

module.exports = JobTaskList;
