import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_METRONOME_JOB_DELETE_ERROR,
  REQUEST_METRONOME_JOB_DELETE_SUCCESS,
  REQUEST_METRONOME_JOB_UPDATE_ERROR,
  REQUEST_METRONOME_JOB_UPDATE_SUCCESS,
  REQUEST_METRONOME_JOB_RUN_ERROR,
  REQUEST_METRONOME_JOB_RUN_SUCCESS,
  REQUEST_METRONOME_JOB_SUSPEND_ERROR,
  REQUEST_METRONOME_JOB_SUSPEND_SUCCESS,
  REQUEST_METRONOME_JOB_DETAIL_ERROR,
  REQUEST_METRONOME_JOB_DETAIL_ONGOING,
  REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
  REQUEST_METRONOME_JOBS_ERROR,
  REQUEST_METRONOME_JOBS_ONGOING,
  REQUEST_METRONOME_JOBS_SUCCESS,
  REQUEST_METRONOME_JOB_CREATE_SUCCESS,
  REQUEST_METRONOME_JOB_CREATE_ERROR
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import MetronomeUtil from '../utils/MetronomeUtil';
import Config from '../config/Config';

const MetronomeActions = {
  createJob: function (data) {
    RequestUtil.json({
      url: `${Config.metronomeAPI}/v0/scheduled-jobs`,
      method: 'POST',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_CREATE_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_CREATE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  fetchJobs: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        RequestUtil.json({
          url: `${Config.metronomeAPI}/v1/jobs`,
          data: [
            {name: 'embed', value: 'activeRuns'},
            {name: 'embed', value: 'schedules'}
          ],
          success: function (response) {
            try {
              let data = MetronomeUtil.parseJobs(response);
              AppDispatcher.handleServerAction({
                type: REQUEST_METRONOME_JOBS_SUCCESS,
                data
              });
              resolve();
            } catch (error) {
              this.error(error);
            }
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_METRONOME_JOBS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: REQUEST_METRONOME_JOBS_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  fetchJobDetail: function (jobID) {
    RequestUtil.json({
      url: `${Config.metronomeAPI}/v1/jobs/${jobID}`,
      data: [
        {name: 'embed', value: 'activeRuns'},
        {name: 'embed', value: 'schedules'}
      ],
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
          data: response,
          jobID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DETAIL_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          jobID,
          xhr
        });
      },
      hangingRequestCallback: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DETAIL_ONGOING,
          jobID
        });
      }
    });
  },

  deleteJob: function (jobID, stopCurrentJobRuns = false) {
    RequestUtil.json({
      url: `${Config.metronomeAPI}/v1/jobs/${jobID}` +
        `?stopCurrentJobRuns=${stopCurrentJobRuns}`,
      method: 'DELETE',
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DELETE_SUCCESS,
          jobID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_DELETE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          jobID,
          xhr
        });
      }
    });
  },

  updateJob: function (jobID, data) {
    RequestUtil.json({
      url: `${Config.metronomeAPI}/v0/scheduled-jobs/${jobID}`,
      method: 'PUT',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_UPDATE_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_UPDATE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  runJob: function (jobID) {
    RequestUtil.json({
      url: `${Config.metronomeAPI}/v1/jobs/${jobID}/runs`,
      method: 'POST',
      data: {},
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_RUN_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_RUN_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  suspendSchedule: function (jobID, data) {
    RequestUtil.json({
      url: `${Config.metronomeAPI}/v1/jobs/${jobID}/schedules/${data.id}`,
      method: 'PUT',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_SUSPEND_SUCCESS,
          jobID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_METRONOME_JOB_SUSPEND_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          jobID,
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const jobFixture = require('../../../tests/_fixtures/metronome/job.json');
  const jobsFixture = require('../../../tests/_fixtures/metronome/jobs.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.MetronomeActions = {
    deleteJob: {
      event: 'success', success: {response: {}}
    },
    fetchJobDetail: {
      event: 'success', success: {response: jobFixture}
    },
    fetchJobs: {
      event: 'success', success: {response: jobsFixture}
    },
    runJob: {
      event: 'success', success: {response: {}}
    },
    suspendSchedule: {
      event: 'success', success: {response: {}}
    }
  };

  Object.keys(global.actionTypes.MetronomeActions).forEach(function (method) {
    MetronomeActions[method] = RequestUtil.stubRequest(
      MetronomeActions, 'MetronomeActions', method
    );
  });
}

module.exports = MetronomeActions;
