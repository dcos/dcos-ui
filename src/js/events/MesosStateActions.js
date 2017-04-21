import { RequestUtil } from "mesosphere-shared-reactjs";

import ActionTypes from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import MesosStateUtil from "../utils/MesosStateUtil";

var MesosStateActions = {
  fetchState: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function(resolve, reject) {
      return function() {
        RequestUtil.json({
          url: `${Config.historyServer}/mesos/master/state`,
          timeout: 2000,
          success(response) {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MESOS_STATE_SUCCESS,
              data: MesosStateUtil.flagMarathonTasks(response)
            });
            resolve();
          },
          error(xhr) {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MESOS_STATE_ERROR,
              data: xhr.message,
              xhr
            });
            reject();
          },
          hangingRequestCallback() {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MESOS_STATE_ONGOING
            });
          }
        });
      };
    },
    { delayAfterCount: Config.delayAfterErrorCount }
  )
};

module.exports = MesosStateActions;
