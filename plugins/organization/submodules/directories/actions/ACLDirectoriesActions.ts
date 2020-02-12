import { RequestUtil } from "mesosphere-shared-reactjs";

import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../constants/ActionTypes";

import SDK from "PluginSDK";

export default {
  fetchDirectories() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/config`,
      success(response) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORIES_SUCCESS,
          // TODO: Remove this array, currently we're forcing an array
          // even though the API is only storing one directory
          data: [response]
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORIES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  addDirectory(data) {
    data.port = parseInt(data.port, 10);

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/config`,
      method: "PUT",
      data,
      success() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_SUCCESS
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  deleteDirectory() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/config`,
      method: "DELETE",
      success() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_SUCCESS
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  testDirectoryConnection(data) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/config/test`,
      method: "POST",
      data,
      success(response) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_TEST_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_TEST_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      },
      hangingRequestCallback() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_TEST_ONGOING
        });
      }
    });
  }
};
