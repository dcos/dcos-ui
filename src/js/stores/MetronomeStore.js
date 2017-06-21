import { EventEmitter } from "events";
import PluginSDK from "PluginSDK";

import {
  REQUEST_METRONOME_JOB_CREATE_ERROR,
  REQUEST_METRONOME_JOB_CREATE_SUCCESS,
  REQUEST_METRONOME_JOB_DELETE_ERROR,
  REQUEST_METRONOME_JOB_DELETE_SUCCESS,
  REQUEST_METRONOME_JOB_DETAIL_ERROR,
  REQUEST_METRONOME_JOB_DETAIL_ONGOING,
  REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
  REQUEST_METRONOME_JOB_RUN_ERROR,
  REQUEST_METRONOME_JOB_RUN_SUCCESS,
  REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
  REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
  REQUEST_METRONOME_JOB_STOP_RUN_ERROR,
  REQUEST_METRONOME_JOB_STOP_RUN_SUCCESS,
  REQUEST_METRONOME_JOB_UPDATE_ERROR,
  REQUEST_METRONOME_JOB_UPDATE_SUCCESS,
  REQUEST_METRONOME_JOBS_ERROR,
  REQUEST_METRONOME_JOBS_ONGOING,
  REQUEST_METRONOME_JOBS_SUCCESS,
  SERVER_ACTION
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import {
  METRONOME_JOB_CREATE_ERROR,
  METRONOME_JOB_CREATE_SUCCESS,
  METRONOME_JOB_DELETE_ERROR,
  METRONOME_JOB_DELETE_SUCCESS,
  METRONOME_JOB_DETAIL_CHANGE,
  METRONOME_JOB_DETAIL_ERROR,
  METRONOME_JOB_RUN_ERROR,
  METRONOME_JOB_RUN_SUCCESS,
  METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
  METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
  METRONOME_JOB_STOP_RUN_ERROR,
  METRONOME_JOB_STOP_RUN_SUCCESS,
  METRONOME_JOB_UPDATE_ERROR,
  METRONOME_JOB_UPDATE_SUCCESS,
  METRONOME_JOBS_CHANGE,
  METRONOME_JOBS_ERROR,
  VISIBILITY_CHANGE
} from "../constants/EventTypes";
import Config from "../config/Config";
import MetronomeActions from "../events/MetronomeActions";
import Job from "../structs/Job";
import JobTree from "../structs/JobTree";
import VisibilityStore from "./VisibilityStore";

let requestInterval;
const jobDetailFetchTimers = {};

function pauseJobDetailMonitors() {
  Object.keys(jobDetailFetchTimers).forEach(function(jobID) {
    global.clearInterval(jobDetailFetchTimers[jobID]);
    jobDetailFetchTimers[jobID] = null;
  });
}

function startPolling() {
  if (!requestInterval) {
    MetronomeActions.fetchJobs();
    requestInterval = global.setInterval(
      MetronomeActions.fetchJobs,
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

class MetronomeStore extends EventEmitter {
  constructor() {
    super(...arguments);

    this.data = {
      jobDetail: {},
      jobTree: { id: "/", items: [] }
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        jobCreateSuccess: METRONOME_JOB_CREATE_SUCCESS,
        jobCreateError: METRONOME_JOB_CREATE_ERROR,
        jobDeleteSuccess: METRONOME_JOB_DELETE_SUCCESS,
        jobDeleteError: METRONOME_JOB_DELETE_ERROR,
        jobDetailChange: METRONOME_JOB_DETAIL_CHANGE,
        jobDetailError: METRONOME_JOB_DETAIL_ERROR,
        jobUpdateSuccess: METRONOME_JOB_UPDATE_SUCCESS,
        jobUpdateError: METRONOME_JOB_UPDATE_ERROR,
        jobRunError: METRONOME_JOB_RUN_ERROR,
        jobRunSuccess: METRONOME_JOB_RUN_SUCCESS,
        jobStopRunError: METRONOME_JOB_STOP_RUN_ERROR,
        jobStopRunSuccess: METRONOME_JOB_STOP_RUN_SUCCESS,
        jobScheduleUpdateError: METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
        jobScheduleUpdateSuccess: METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
        change: METRONOME_JOBS_CHANGE,
        error: METRONOME_JOBS_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    // Handle app actions
    this.dispatcherIndex = AppDispatcher.register(({ source, action }) => {
      if (source !== SERVER_ACTION) {
        return false;
      }
      switch (action.type) {
        case REQUEST_METRONOME_JOB_CREATE_SUCCESS:
          this.emit(METRONOME_JOB_CREATE_SUCCESS);
          break;
        case REQUEST_METRONOME_JOB_CREATE_ERROR:
          this.emit(METRONOME_JOB_CREATE_ERROR, action.data);
          break;
        case REQUEST_METRONOME_JOB_DELETE_ERROR:
          this.emit(METRONOME_JOB_DELETE_ERROR, action.jobID, action.data);
          break;
        case REQUEST_METRONOME_JOB_DELETE_SUCCESS:
          this.emit(METRONOME_JOB_DELETE_SUCCESS, action.jobID);
          break;
        case REQUEST_METRONOME_JOB_DETAIL_SUCCESS:
          this.data.jobDetail[action.jobID] = action.data;
          this.emit(METRONOME_JOB_DETAIL_CHANGE);
          break;
        case REQUEST_METRONOME_JOB_DETAIL_ONGOING:
          break;
        case REQUEST_METRONOME_JOB_DETAIL_ERROR:
          this.emit(METRONOME_JOB_DETAIL_ERROR);
          break;
        case REQUEST_METRONOME_JOB_UPDATE_SUCCESS:
          this.emit(METRONOME_JOB_UPDATE_SUCCESS);
          break;
        case REQUEST_METRONOME_JOB_UPDATE_ERROR:
          this.emit(METRONOME_JOB_UPDATE_ERROR, action.data);
          break;
        case REQUEST_METRONOME_JOB_RUN_ERROR:
          this.emit(METRONOME_JOB_RUN_ERROR, action.jobID);
          break;
        case REQUEST_METRONOME_JOB_RUN_SUCCESS:
          this.emit(METRONOME_JOB_RUN_SUCCESS, action.jobID);
          break;
        case REQUEST_METRONOME_JOB_STOP_RUN_ERROR:
          this.emit(METRONOME_JOB_STOP_RUN_ERROR, action.jobID);
          break;
        case REQUEST_METRONOME_JOB_STOP_RUN_SUCCESS:
          this.emit(METRONOME_JOB_STOP_RUN_SUCCESS, action.jobID);
          break;
        case REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_ERROR:
          this.emit(METRONOME_JOB_SCHEDULE_UPDATE_ERROR, action.jobID);
          break;
        case REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS:
          this.emit(METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS, action.jobID);
          break;
        case REQUEST_METRONOME_JOBS_SUCCESS:
          this.data.jobTree = action.data;
          this.emit(METRONOME_JOBS_CHANGE);
          break;
        case REQUEST_METRONOME_JOBS_ONGOING:
          break;
        case REQUEST_METRONOME_JOBS_ERROR:
          this.emit(METRONOME_JOBS_ERROR);
          break;
      }

      return true;
    });

    VisibilityStore.addChangeListener(
      VISIBILITY_CHANGE,
      this.onVisibilityStoreChange.bind(this)
    );
  }

  createJob(job) {
    MetronomeActions.createJob(job);
  }

  deleteJob(jobID, stopCurrentJobRuns) {
    MetronomeActions.deleteJob(jobID, stopCurrentJobRuns);
  }

  fetchJobDetail(jobID) {
    MetronomeActions.fetchJobDetail(jobID);
  }

  updateJob(jobId, job) {
    MetronomeActions.updateJob(jobId, job);
  }

  runJob(jobID) {
    MetronomeActions.runJob(jobID);
  }

  stopJobRun(jobID, jobRunID) {
    const job = this.getJob(jobID);

    if (job == null || jobRunID == null) {
      return;
    }

    MetronomeActions.stopJobRun(jobID, jobRunID);
  }

  toggleSchedule(jobID, isEnabled = true) {
    const job = this.getJob(jobID);

    if (job == null) {
      return null;
    }

    const [schedule] = job.getSchedules();

    if (schedule == null) {
      return null;
    }

    this.updateSchedule(
      jobID,
      Object.assign({}, schedule, { enabled: isEnabled })
    );
  }

  updateSchedule(jobID, schedule) {
    if (schedule == null) {
      return;
    }

    MetronomeActions.updateSchedule(jobID, schedule);
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

  getJob(jobID) {
    if (this.data.jobDetail[jobID] == null) {
      return null;
    }

    return new Job(this.data.jobDetail[jobID]);
  }

  monitorJobDetail(jobID) {
    if (jobDetailFetchTimers[jobID] != null || jobID == null) {
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
      Object.keys(jobDetailFetchTimers).forEach(jobID => {
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
    return this.listeners(METRONOME_JOBS_CHANGE).length > 0;
  }

  stopJobDetailMonitor(jobID) {
    if (jobID != null) {
      global.clearInterval(jobDetailFetchTimers[jobID]);
      delete jobDetailFetchTimers[jobID];

      return;
    }

    Object.keys(jobDetailFetchTimers).forEach(function(fetchTimerID) {
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
    return "metronome";
  }
}

module.exports = new MetronomeStore();
