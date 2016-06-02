import {EventEmitter} from 'events';

import AppDispatcher from '../events/AppDispatcher';
import ChronosActions  from '../events/ChronosActions';
import {
  CHRONOS_JOB_DELETE_ERROR,
  CHRONOS_JOB_DELETE_SUCCESS,
  CHRONOS_JOB_DETAIL_CHANGE,
  CHRONOS_JOB_DETAIL_ERROR,
  CHRONOS_JOB_RUN_ERROR,
  CHRONOS_JOB_RUN_SUCCESS,
  CHRONOS_JOB_SUSPEND_ERROR,
  CHRONOS_JOB_SUSPEND_SUCCESS,
  CHRONOS_JOBS_CHANGE,
  CHRONOS_JOBS_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
import Config from '../config/Config';
import JobTree from '../structs/JobTree';
import {
  REQUEST_CHRONOS_JOB_DELETE_ERROR,
  REQUEST_CHRONOS_JOB_DELETE_SUCCESS,
  REQUEST_CHRONOS_JOB_DETAIL_ERROR,
  REQUEST_CHRONOS_JOB_DETAIL_ONGOING,
  REQUEST_CHRONOS_JOB_DETAIL_SUCCESS,
  REQUEST_CHRONOS_JOB_RUN_ERROR,
  REQUEST_CHRONOS_JOB_RUN_SUCCESS,
  REQUEST_CHRONOS_JOB_SUSPEND_ERROR,
  REQUEST_CHRONOS_JOB_SUSPEND_SUCCESS,
  REQUEST_CHRONOS_JOBS_ERROR,
  REQUEST_CHRONOS_JOBS_ONGOING,
  REQUEST_CHRONOS_JOBS_SUCCESS,
  SERVER_ACTION
} from '../constants/ActionTypes';

import VisibilityStore from './VisibilityStore';

let requestInterval;
let jobDetailFetchTimers = {};

function pauseJobDetailMonitors() {
  Object.keys(jobDetailFetchTimers).forEach(function (jobID) {
    global.clearInterval(jobDetailFetchTimers[jobID]);
    jobDetailFetchTimers[jobID] = null;
  });
}

function startPolling() {
  if (!requestInterval) {
    ChronosActions.fetchJobs();
    requestInterval = global.setInterval(
      ChronosActions.fetchJobs,
      Config.getRefreshRate()
    );
  }
}

function stopPolling() {
  if (requestInterval) {
    global.clearInterval(requestInterval);
    requestInterval = null;
  }
}

class ChronosStore extends EventEmitter {
  constructor() {
    super(...arguments);

    this.data = {
      jobDetail: {},
      jobTree: {id: '/', items: []}
    };

    // Handle app actions
    this.dispatcherIndex = AppDispatcher.register(({source, action}) => {
      if (source !== SERVER_ACTION) {
        return false;
      }
      switch (action.type) {
        case REQUEST_CHRONOS_JOB_DELETE_ERROR:
          this.emit(CHRONOS_JOB_DELETE_ERROR, action.jobID);
          break;
        case REQUEST_CHRONOS_JOB_DELETE_SUCCESS:
          this.emit(CHRONOS_JOB_DELETE_SUCCESS, action.jobID);
          break;
        case REQUEST_CHRONOS_JOB_DETAIL_SUCCESS:
          this.data.jobDetail[action.jobID] = action.data;
          this.emit(CHRONOS_JOB_DETAIL_CHANGE);
          break;
        case REQUEST_CHRONOS_JOB_DETAIL_ONGOING:
          break;
        case REQUEST_CHRONOS_JOB_DETAIL_ERROR:
          this.emit(CHRONOS_JOB_DETAIL_ERROR);
          break;
        case REQUEST_CHRONOS_JOB_RUN_ERROR:
          this.emit(CHRONOS_JOB_RUN_ERROR, action.jobID);
          break;
        case REQUEST_CHRONOS_JOB_RUN_SUCCESS:
          this.emit(CHRONOS_JOB_RUN_SUCCESS, action.jobID);
          break;
        case REQUEST_CHRONOS_JOB_SUSPEND_ERROR:
          this.emit(CHRONOS_JOB_SUSPEND_ERROR, action.jobID);
          break;
        case REQUEST_CHRONOS_JOB_SUSPEND_SUCCESS:
          this.emit(CHRONOS_JOB_SUSPEND_SUCCESS, action.jobID);
          break;
        case REQUEST_CHRONOS_JOBS_SUCCESS:
          this.data.jobTree = action.data;
          this.emit(CHRONOS_JOBS_CHANGE);
          break;
        case REQUEST_CHRONOS_JOBS_ONGOING:
          break;
        case REQUEST_CHRONOS_JOBS_ERROR:
          this.emit(CHRONOS_JOBS_ERROR);
          break;

      }

      return true;
    });

    VisibilityStore.addChangeListener(
      VISIBILITY_CHANGE,
      this.onVisibilityStoreChange.bind(this)
    );
  }

  deleteJob(jobID) {
    ChronosActions.deleteJob(jobID);
  }

  fetchJobDetail(jobID) {
    ChronosActions.fetchJobDetail(jobID);
  }

  runJob(jobDefinition) {
    ChronosActions.runJob(jobDefinition);
  }

  suspendJob(jobID) {
    ChronosActions.suspendJob(jobID);
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);

    // Start polling if there is at least one listener
    if (this.shouldPoll()) {
      startPolling();
    }
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);

    // Stop polling if no one is listening
    if (!this.shouldPoll()) {
      stopPolling();
    }
  }

  monitorJobDetail(jobID) {
    if (jobDetailFetchTimers[jobID] != null) {
      // Already monitoring
      return;
    }

    if (!VisibilityStore.isInactive()) {
      this.fetchJobDetail(jobID);

      jobDetailFetchTimers[jobID] = global.setInterval(
        this.fetchJobDetail.bind(this, jobID),
        Config.getRefreshRate()
      );
    }
  }

  onVisibilityStoreChange() {
    if (!VisibilityStore.isInactive()) {
      Object.keys(jobDetailFetchTimers).forEach((jobID) => {
        this.monitorJobDetail(jobID);
      });

      if (this.shouldPoll()) {
        startPolling();
        return;
      }
    }

    pauseJobDetailMonitors();
    stopPolling();
  }

  shouldPoll() {
    return !!this.listeners(CHRONOS_JOBS_CHANGE).length;
  }

  stopJobDetailMonitor(jobID) {
    if (jobID != null) {
      global.clearInterval(jobDetailFetchTimers[jobID]);
      delete jobDetailFetchTimers[jobID];
      return;
    }

    Object.keys(jobDetailFetchTimers).forEach(function (fetchTimerID) {
      global.clearInterval(jobDetailFetchTimers[fetchTimerID]);
      delete jobDetailFetchTimers[fetchTimerID];
    });
  }

  /**
   * @type {JobTree}
   */
  get jobTree() {
    return new JobTree(this.data.jobTree);
  }

  get storeID() {
    return 'chronos';
  }
}

module.exports = new ChronosStore();
