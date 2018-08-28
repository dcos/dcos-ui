import { RequestUtil } from "mesosphere-shared-reactjs";

import {
  REQUEST_METRONOME_JOB_DELETE_ERROR,
  REQUEST_METRONOME_JOB_DELETE_SUCCESS,
  REQUEST_METRONOME_JOB_UPDATE_ERROR,
  REQUEST_METRONOME_JOB_UPDATE_SUCCESS,
  REQUEST_METRONOME_JOB_RUN_ERROR,
  REQUEST_METRONOME_JOB_RUN_SUCCESS,
  REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
  REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
  REQUEST_METRONOME_JOB_DETAIL_ERROR,
  REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
  REQUEST_METRONOME_JOBS_ERROR,
  REQUEST_METRONOME_JOBS_SUCCESS,
  REQUEST_METRONOME_JOB_CREATE_SUCCESS,
  REQUEST_METRONOME_JOB_CREATE_ERROR,
  REQUEST_METRONOME_JOB_STOP_RUN_SUCCESS,
  REQUEST_METRONOME_JOB_STOP_RUN_ERROR
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import * as MetronomeClient from "./MetronomeClient";

const MetronomeActions = {
  createJob(data) {
    MetronomeClient.createJob(data).subscribe({
      next: () =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_CREATE_SUCCESS
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_CREATE_ERROR,
          data: xhr.response,
          xhr
        })
    });
  },

  fetchJobs() {
    MetronomeClient.fetchJobs().subscribe({
      next: ({ response }) =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOBS_SUCCESS,
          data: response
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOBS_ERROR,
          data: xhr.message,
          xhr
        })
    });
  },

  fetchJobDetail(jobID) {
    MetronomeClient.fetchJobDetail(jobID).subscribe({
      next: ({ response }) =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
          data: response,
          jobID
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DETAIL_ERROR,
          data: xhr.response,
          jobID,
          xhr
        })
    });
  },

  deleteJob(jobID, stopCurrentJobRuns = false) {
    MetronomeClient.deleteJob(jobID, stopCurrentJobRuns).subscribe({
      next: () =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DELETE_SUCCESS,
          jobID
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DELETE_ERROR,
          data: xhr.response,
          jobID,
          xhr
        })
    });
  },

  updateJob(jobID, data) {
    MetronomeClient.updateJob(jobID, data).subscribe({
      next: () =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_UPDATE_SUCCESS
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_UPDATE_ERROR,
          data: xhr.response,
          xhr
        })
    });
  },

  runJob(jobID) {
    MetronomeClient.runJob(jobID).subscribe({
      next: () =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_RUN_SUCCESS
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_RUN_ERROR,
          data: xhr.response,
          xhr
        })
    });
  },

  stopJobRun(jobID, jobRunID) {
    MetronomeClient.stopJobRun(jobID, jobRunID).subscribe({
      next: () =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_STOP_RUN_SUCCESS
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_STOP_RUN_ERROR,
          data: xhr.response,
          xhr
        })
    });
  },

  updateSchedule(jobID, data) {
    MetronomeClient.updateSchedule(jobID, data).subscribe({
      next: () =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
          jobID
        }),
      error: xhr =>
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
          data: xhr.response,
          jobID,
          xhr
        })
    });
  }
};

if (Config.useFixtures) {
  const jobFixture = require("../../../tests/_fixtures/metronome/job.json");
  const jobsFixture = require("../../../tests/_fixtures/metronome/jobs.json");

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.MetronomeActions = {
    deleteJob: {
      event: "success",
      success: { response: {} }
    },
    fetchJobDetail: {
      event: "success",
      success: { response: jobFixture }
    },
    fetchJobs: {
      event: "success",
      success: { response: jobsFixture }
    },
    runJob: {
      event: "success",
      success: { response: {} }
    },
    stopJobRun: {
      event: "success",
      success: { response: {} }
    },
    updateSchedule: {
      event: "success",
      success: { response: {} }
    }
  };

  Object.keys(global.actionTypes.MetronomeActions).forEach(function(method) {
    MetronomeActions[method] = RequestUtil.stubRequest(
      MetronomeActions,
      "MetronomeActions",
      method
    );
  });
}

module.exports = MetronomeActions;
