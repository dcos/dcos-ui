import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_CHRONOS_JOBS_ERROR,
  REQUEST_CHRONOS_JOBS_ONGOING,
  REQUEST_CHRONOS_JOBS_SUCCESS
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';

const ChronosActions = {
  fetchJobs: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        RequestUtil.json({
          url: `${Config.rootUrl}/chronos/jobs`,
          data: [{name: 'embed', value: 'activeJobs'}],
          success: function (response) {
            let data;
            try {
              data = ChronosUtil.parseJobs(response);
            } catch (error) {
              AppDispatcher.handleServerAction({
                type: REQUEST_CHRONOS_JOBS_ERROR,
                data: error
              });
              reject();
            }

            AppDispatcher.handleServerAction({
              type: REQUEST_CHRONOS_JOBS_SUCCESS,
              data
            });
            resolve();
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
};

if (Config.useFixtures) {
  const jobsFixture = require('../../../tests/_fixtures/chronos/jobs.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.ChronosActions = {
    fetchJobs: {
      event: 'success', success: {response: jobsFixture}
    }
  };

  Object.keys(global.actionTypes.ChronosActions).forEach(function (method) {
    ChronosActions[method] = RequestUtil.stubRequest(
      ChronosActions, 'ChronosActions', method
    );
  });
}

module.exports = ChronosActions;
