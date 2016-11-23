import {RequestUtil} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';
import MesosStateUtil from '../utils/MesosStateUtil';

function getNodeStateURL(task, node) {
  let pid, nodePID;

  if (node) {
    pid = node.pid;
  }

  if (pid) {
    nodePID = pid.substring(0, pid.indexOf('@'));
  }

  return `${Config.rootUrl}/agent/${task.slave_id}/${nodePID}/state`;
}

var MesosStateActions = {

  fetchState: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
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
          error(e) {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MESOS_STATE_ERROR,
              data: e.message
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
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  fetchNodeState: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function (task, node, success, error) {
        return RequestUtil.json({
          url: getNodeStateURL(task, node),
          success(response) {
            resolve();
            success(response);
          },
          error(xhr) {
            if (xhr.statusText === 'abort') {
              resolve();
              return;
            }
            reject();
            error(xhr);
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  )
};

module.exports = MesosStateActions;
