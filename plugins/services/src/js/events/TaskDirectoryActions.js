import { RequestUtil } from "mesosphere-shared-reactjs";

import {
  REQUEST_NODE_STATE_ERROR,
  REQUEST_NODE_STATE_SUCCESS,
  REQUEST_TASK_DIRECTORY_ERROR,
  REQUEST_TASK_DIRECTORY_SUCCESS
} from "../constants/ActionTypes";
import AppDispatcher from "../../../../../src/js/events/AppDispatcher";
import Config from "../../../../../src/js/config/Config";
import MesosStateUtil from "../../../../../src/js/utils/MesosStateUtil";

function getNodeStateURL(task, node) {
  let pid, nodePID;

  if (node) {
    pid = node.pid;
  }

  if (pid) {
    nodePID = pid.substring(0, pid.indexOf("@"));
  }

  return `${Config.rootUrl}/agent/${task.slave_id}/${nodePID}/state`;
}

var TaskDirectoryActions = {
  getDownloadURL(nodeID, path) {
    return `${Config.rootUrl}/agent/${nodeID}/files/download?path=${path}`;
  },

  fetchNodeState: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function(resolve, reject) {
      return function(task, node, innerPath) {
        return RequestUtil.json({
          url: getNodeStateURL(task, node),
          success(response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_NODE_STATE_SUCCESS,
              data: response,
              task,
              node,
              innerPath
            });
            resolve();
          },
          error(xhr) {
            if (xhr.statusText === "abort") {
              resolve();

              return;
            }

            AppDispatcher.handleServerAction({
              type: REQUEST_NODE_STATE_ERROR,
              data: xhr.message,
              task,
              node,
              xhr
            });
            reject();
          }
        });
      };
    },
    { delayAfterCount: Config.delayAfterErrorCount }
  ),

  fetchDirectory(task, innerPath, nodeState) {
    const path = MesosStateUtil.getTaskPath(nodeState, task, innerPath);
    if (path == null) {
      AppDispatcher.handleServerAction({
        type: REQUEST_TASK_DIRECTORY_ERROR,
        task
      });

      return;
    }

    RequestUtil.json({
      url: `${Config.rootUrl}/agent/${task.slave_id}/files/browse`,
      data: { path },
      success(directory) {
        AppDispatcher.handleServerAction({
          type: REQUEST_TASK_DIRECTORY_SUCCESS,
          data: directory,
          innerPath,
          task
        });
      },
      error(xhr) {
        if (xhr.statusText === "abort") {
          return;
        }

        AppDispatcher.handleServerAction({
          type: REQUEST_TASK_DIRECTORY_ERROR,
          data: xhr.message,
          task,
          xhr
        });
      }
    });
  }
};

module.exports = TaskDirectoryActions;
