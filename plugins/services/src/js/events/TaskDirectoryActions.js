import {RequestUtil} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../../../../../src/js/events/AppDispatcher';
import Config from '../../../../../src/js/config/Config';
import MesosStateUtil from '../../../../../src/js/utils/MesosStateUtil';
import MesosStateActions from '../../../../../src/js/events/MesosStateActions';

var TaskDirectoryActions = {
  getDownloadURL(nodeID, path) {
    return `${Config.rootUrl}/agent/${nodeID}/files/download?` +
      `path=${path}`;
  },

  fetchNodeState(task, node, callback) {
    MesosStateActions.fetchNodeState(task, node, callback, function (xhr) {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_TASK_DIRECTORY_ERROR,
        data: xhr.message
      });
    });
  },

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
