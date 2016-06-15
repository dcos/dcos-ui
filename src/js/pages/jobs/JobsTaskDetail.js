/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import TaskDetail from '../services/task-details/TaskDetail';
import ChronosStore from '../../stores/ChronosStore';

/* eslint-disable no-unused-vars */
const METHODS_TO_BIND = [
  'handleKillButtonClick'
];
/* eslint-enable no-unused-vars */

class JobsTaskDetail extends TaskDetail {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      'jobs-task-details-tab': 'Details',
      'jobs-task-details-files': 'Files',
      'jobs-task-details-logs': 'Logs'
    };

    this.store_listeners = [
    ];
  }

  componentDidMount() {

  }

  handleKillButtonClick() {

  }

  getJob() {
    return ChronosStore.getJob(this.props.params.id);
  }

  getTask() {
    let job = this.getJob();

    return job.getTaskByID(this.props.params.taskID);
  };

  getTaskActionButtons() {
    let jobID = this.props.params.id;

    return [
      <button
        className="button button-inverse button-stroke button-danger"
        key="kill"
        onClick={this.handleKillButtonClick.bind(this, jobID)}>
        Kill Task
      </button>
    ];
  }

  getTaskIcon() {
    return null;
  }

  getTaskName(task) {
    return task.id;
  }

  getTaskSubtitle() {
    return 'subTitle';
  }

  isPageReady() {
    return true;
  }

  isSubviewReady() {
    return true;
  }
}

module.exports = JobsTaskDetail;
