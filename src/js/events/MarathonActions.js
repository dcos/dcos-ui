import ActionTypes from '../constants/ActionTypes';
var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');
var RequestUtil = require('../utils/RequestUtil');

module.exports = {

  fetchApps: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        const embed = 'embed=group.groups&embed=group.apps&' +
          'embed=group.apps.deployments&embed=group.apps.counts';
        let url = `${Config.rootUrl}/marathon/v2/groups?${embed}`;

        RequestUtil.json({
          url: url,
          success: function (response) {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MARATHON_APPS_SUCCESS,
              data: response
            });
            resolve();
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MARATHON_APPS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MARATHON_APPS_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  )

};
