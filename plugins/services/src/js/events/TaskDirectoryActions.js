import {RequestUtil} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../../../../../src/js/events/AppDispatcher';
import Config from '../../../../../src/js/config/Config';

function findWithID(stateObject, listProps, id) {
  let searchItem;
  let length = listProps.length;

  for (let i = 0; i < length; i++) {
    let array = stateObject[listProps[i]];

    if (array) {
      searchItem = array.find(function (element) {
        return element.id === id;
      });

      if (searchItem) {
        return searchItem;
      }
    }
  }

  return null;
}

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

  getInnerPath(nodeState, task, innerPath) {
    innerPath = innerPath || '';

    // Search frameworks
    let framework = findWithID(
      nodeState,
      ['frameworks', 'completed_frameworks'],
      task.framework_id
    );

    if (!framework) {
      return null;
    }

    // Search executors
    let executor = findWithID(
      framework,
      ['executors', 'completed_executors'],
      task.executor_id || task.id // Fallback to task id, if no executor id
    );

    if (!executor) {
      return null;
    }

    return `${executor.directory}/${innerPath}`;
  },

  fetchNodeState: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function (task, node, cb) {
        return RequestUtil.json({
          url: TaskDirectoryActions.getNodeStateJSON(task, node),
          timeout: 5000,
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
    let path = TaskDirectoryActions.getInnerPath(nodeState, task, innerPath);
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
