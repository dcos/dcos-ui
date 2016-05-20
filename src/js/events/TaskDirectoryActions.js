import {RequestUtil} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';
// TODO for mlunoe: We shouldn't be including stores in these files. DCOS-4430
import MesosStateStore from '../stores/MesosStateStore';

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
  getDownloadURL: function (nodeID, path) {
    return `${Config.rootUrl}/slave/${nodeID}/files/download?` +
      `path=${path}`;
  },

  getNodeStateJSON: function (task) {
    let pid = MesosStateStore.getNodeFromID(task.slave_id).pid;
    let nodePID = pid.substring(0, pid.indexOf('@'));

    return `${Config.rootUrl}/slave/${task.slave_id}/${nodePID}/state`;
  },

  getInnerPath: function (nodeState, task, innerPath) {
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
      return function (task, cb) {
        return RequestUtil.json({
          url: TaskDirectoryActions.getNodeStateJSON(task),
          success: function (response) {
            resolve();
            cb(response);
          },
          error: function (xhr) {
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

  fetchDirectory: function (task, innerPath, nodeState) {
    innerPath = TaskDirectoryActions.getInnerPath(nodeState, task, innerPath);
    if (innerPath == null) {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_TASK_DIRECTORY_ERROR
      });
      return;
    }

    RequestUtil.json({
      url: `${Config.rootUrl}/slave/${task.slave_id}/files/browse`,
      data: {
        path: innerPath
      },
      success: function (directory) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_TASK_DIRECTORY_SUCCESS,
          data: directory,
          sandBoxPath: innerPath
        });
      },
      error: function (xhr) {
        if (xhr.statusText === 'abort') {
          return;
        }

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_TASK_DIRECTORY_ERROR,
          data: xhr.message
        });
      }
    });
  }
};

module.exports = TaskDirectoryActions;
