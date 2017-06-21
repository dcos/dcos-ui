import { RequestUtil } from "mesosphere-shared-reactjs";

import ActionTypes from "../constants/ActionTypes";
import AppDispatcher from "../../../../../src/js/events/AppDispatcher";
import Config from "../../../../../src/js/config/Config";

const MesosLogActions = {
  requestOffset(slaveID, path) {
    RequestUtil.json({
      url: `${Config.rootUrl}/agent/${slaveID}/files/read?path=${path}&offset=-1`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS,
          data: response,
          path,
          slaveID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_MESOS_LOG_OFFSET_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          path,
          slaveID,
          xhr
        });
      }
    });
  },

  fetchLog(slaveID, path, offset, length) {
    RequestUtil.json({
      url: `${Config.rootUrl}/agent/${slaveID}/files/read?path=${path}&offset=${offset}&length=${length}`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_MESOS_LOG_SUCCESS,
          data: response,
          path,
          slaveID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_MESOS_LOG_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          path,
          slaveID,
          xhr
        });
      }
    });
  },

  fetchPreviousLog(slaveID, path, offset, length) {
    RequestUtil.json({
      url: `${Config.rootUrl}/agent/${slaveID}/files/read?path=${path}&offset=${offset}&length=${length}`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_SUCCESS,
          data: response,
          path,
          slaveID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          path,
          slaveID,
          xhr
        });
      }
    });
  }
};

module.exports = MesosLogActions;
