import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_CHRONOS_JOB_DELETE_ERROR,
  REQUEST_CHRONOS_JOB_DELETE_SUCCESS,
  REQUEST_CHRONOS_JOB_RUN_ERROR,
  REQUEST_CHRONOS_JOB_RUN_SUCCESS,
  REQUEST_CHRONOS_JOB_SUSPEND_ERROR,
  REQUEST_CHRONOS_JOB_SUSPEND_SUCCESS,
  REQUEST_CHRONOS_JOB_DETAIL_ERROR,
  REQUEST_CHRONOS_JOB_DETAIL_ONGOING,
  REQUEST_CHRONOS_JOB_DETAIL_SUCCESS,
  REQUEST_CHRONOS_JOBS_ERROR,
  REQUEST_CHRONOS_JOBS_ONGOING,
  REQUEST_CHRONOS_JOBS_SUCCESS
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import ChronosUtil from '../utils/ChronosUtil';
import Config from '../config/Config';

const ChronosActions = {
  fetchJobs: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        RequestUtil.json({
          url: `${Config.rootUrl}/chronos/jobs`,
          data: [
            {name: 'embed', value: 'activeRuns'},
            {name: 'embed', value: 'schedules'}
          ],
          success: function (response) {
            try {
              let data = ChronosUtil.parseJobs(response);
              AppDispatcher.handleServerAction({
                type: REQUEST_CHRONOS_JOBS_SUCCESS,
                data
              });
              resolve();
            } catch (error) {
              this.error(error);
            }
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_CHRONOS_JOBS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: REQUEST_CHRONOS_JOBS_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  fetchJobDetail: function (jobID) {
    RequestUtil.json({
      url: `${Config.rootUrl}/chronos/jobs/${jobID}`,
      data: [
        {name: 'embed', value: 'activeRuns'},
        {name: 'embed', value: 'schedules'}
      ],
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_DETAIL_SUCCESS,
          data: response,
          jobID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_DETAIL_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          jobID,
          xhr
        });
      },
      hangingRequestCallback: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_DETAIL_ONGOING,
          jobID
        });
      }
    });
  },

  deleteJob: function (jobID, stopCurrentJobRuns = false) {
    RequestUtil.json({
      url: `${Config.rootUrl}/chronos/jobs/${jobID}` +
        `?stopCurrentJobRuns=${stopCurrentJobRuns}`,
      method: 'DELETE',
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_DELETE_SUCCESS,
          jobID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_DELETE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          jobID,
          xhr
        });
      }
    });
  },

  runJob: function (jobID) {
    RequestUtil.json({
      url: `${Config.rootUrl}/jobs/${jobID}/runs`,
      method: 'POST',
      data: {},
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_RUN_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_RUN_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  suspendSchedule: function (jobID, data) {
    RequestUtil.json({
      url: `${Config.rootUrl}/chronos/jobs/${jobID}/schedules/${data.id}`,
      method: 'PUT',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_SUSPEND_SUCCESS,
          jobID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_CHRONOS_JOB_SUSPEND_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          jobID,
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const jobFixture = require('../../../tests/_fixtures/chronos/job.json');
  const jobsFixture = require('../../../tests/_fixtures/chronos/jobs.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.ChronosActions = {
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

  Object.keys(global.actionTypes.ChronosActions).forEach(function (method) {
    ChronosActions[method] = RequestUtil.stubRequest(
      ChronosActions, 'ChronosActions', method
    );
  });
}

module.exports = ChronosActions;
