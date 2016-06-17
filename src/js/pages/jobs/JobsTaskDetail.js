import classNames from 'classnames';
import {Confirm} from 'reactjs-components';

/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import ChronosStore from '../../stores/ChronosStore';
import TaskDetail from '../services/task-details/TaskDetail';
import TaskStates from '../../constants/TaskStates';

/* eslint-disable no-unused-vars */
const METHODS_TO_BIND = [
  'handleKillButtonClick'
];
/* eslint-enable no-unused-vars */

const JOBS_TABS = {
  'jobs-task-details-tab': 'Details',
  'jobs-task-details-files': 'Files',
  'jobs-task-details-logs': 'Logs'
};

const MORE_METHODS_TO_BIND = [
  'handleKillButtonClick',
  'handleKillModalClose',
  'handleTaskKill'
]

class JobsTaskDetail extends TaskDetail {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'state', events: ['success'], listenAlways: false},
      {name: 'summary', events: ['success'], listenAlways: false},
      {name: 'taskDirectory', events: ['error', 'success']},
      {name: 'chronos', events: ['jobSuspendSuccess', 'jobSuspendError']}
    ];

    this.state = {
      directory: null,
      selectedLogFile: null,
      errorCount: 0,
      openKillConfirm: false,
      killError: null
    };

    MORE_METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

    this.tabs_tabs = Object.assign({}, JOBS_TABS);
    this.updateCurrentTab();
  }

  onChronosStoreJobSuspendError() {
    this.setState({killError: true});
  }

  onChronosStoreJobSuspendSuccess() {
    this.handleKillModalClose();
  }

  handleKillButtonClick() {
    this.setState({openKillConfirm: true});
  }

  handleKillModalClose() {
    this.setState({
      openKillConfirm: false,
      killError: false
    });
  }

  handleTaskKill() {
    ChronosStore.suspendSchedule(this.props.params.taskID);
  }

  getConfirmModal() {
    return (
      <Confirm
        closeByBackdropClick={true}
        footerContainerClass="container container-pod container-pod-short
          container-pod-fluid flush-top flush-bottom"
        open={this.state.openKillConfirm}
        onClose={this.handleKillModalClose}
        leftButtonCallback={this.handleKillModalClose}
        leftButtonText="Cancel"
        rightButtonCallback={this.handleTaskKill}
        rightButtonClassName="button button-danger"
        rightButtonText="Kill">
        {this.getConfirmModalContent()}
      </Confirm>
    )
  }

  getConfirmModalContent() {
    let error = '';

    if (this.state.killError) {
      error = (
        <p className="text-danger text-small text-align-center">
          An error has occurred.
        </p>
      );
    }

    return (
      <div className="container-pod container-pod-short text-align-center">
        <h3 className="flush-top">Are you sure?</h3>
        {error}
        <p>
          {`${this.props.params.taskID} will be killed.`}
        </p>
      </div>
    );
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

  getTaskSubtitle(task) {
    let status = TaskStates[task.getStatus()];
    let statusClasses = classNames('job-details-header-status', {
      'text-success': status.stateTypes.includes('success')
        && status.stateTypes.includes('failure'),
      'text-danger': status.stateTypes.includes('failure')
    });

    return (
      <span className={statusClasses} key="status-text">
        {status.displayName}
      </span>
    );
  }

  isSubviewReady(task) {
    return task;
  }
}

module.exports = JobsTaskDetail;
