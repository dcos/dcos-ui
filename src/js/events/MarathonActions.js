import {
  REQUEST_MARATHON_GROUPS_SUCCESS,
  REQUEST_MARATHON_GROUPS_ERROR,
  REQUEST_MARATHON_GROUPS_ONGOING
} from '../constants/ActionTypes';
var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');
var RequestUtil = require('../utils/RequestUtil');

module.exports = {

  fetchGroups: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        const url = `${Config.rootUrl}/marathon/v2/groups`;
        const embed = [
          {name: 'embed', value: 'group.groups'},
          {name: 'embed', value: 'group.apps'},
          {name: 'embed', value: 'group.apps.deployments'},
          {name: 'embed', value: 'group.apps.counts'}
        ];

        RequestUtil.json({
          url: url,
          data: embed,
          success: function (response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_SUCCESS,
              data: response
            });
            resolve();
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  )

};
