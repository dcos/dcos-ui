import {RequestUtil} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../../../../../src/js/events/AppDispatcher';
import Config from '../../../../../src/js/config/Config';
import MesosStateUtil from '../../../../../src/js/utils/MesosStateUtil';

var TaskDirectoryActions = {
  getDownloadURL(nodeID, path) {
    return `${Config.rootUrl}/agent/${nodeID}/files/download?` +
      `path=${path}`;
  },

  getNodeStateJSON(task, node) {
    let pid, nodePID;

    if (node) {
      pid = node.pid;
    }

    if (pid) {
      nodePID = pid.substring(0, pid.indexOf('@'));
    }

    return `${Config.rootUrl}/agent/${task.slave_id}/${nodePID}/state`;
  },

  fetchNodeState: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function (task, node, cb) {
        return RequestUtil.json({
          url: TaskDirectoryActions.getNodeStateJSON(task, node),
          success(response) {
            resolve();
            cb(response);
          },
          error(xhr) {
            if (xhr.statusText === 'abort') {
              resolve();
              return;
            }

            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_TASK_DIRECTORY_ERROR,
              data: xhr.message
            });

            reject();
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  fetchDirectory(task, innerPath, nodeState) {
    let path = MesosStateUtil.getTaskPath(nodeState, task, innerPath);
    if (path == null) {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_TASK_DIRECTORY_ERROR
      });
      return;
    }

    RequestUtil.json({
      url: `${Config.rootUrl}/agent/${task.slave_id}/files/browse`,
      data: {path},
      success(directory) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_TASK_DIRECTORY_SUCCESS,
          data: directory,
          innerPath,
          taskID: task.id
        });
      },
      error(xhr) {
        if (xhr.statusText === 'abort') {
          return;
        }

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_TASK_DIRECTORY_ERROR,
          data: xhr.message,
          taskID: task.id
        });
      }
    });
  }
};

module.exports = TaskDirectoryActions;
