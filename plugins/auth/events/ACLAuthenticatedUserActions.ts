import { RequestUtil } from "mesosphere-shared-reactjs";
import { Store } from "PluginSDK";

import Config from "#SRC/js/config/Config";
import {
  REQUEST_PERMISSIONS_ERROR,
  REQUEST_PERMISSIONS_SUCCESS
} from "../constants/ActionTypes";

export default {
  fetchPermissions(userID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}/permissions`,
      success(response) {
        Store.dispatch({
          type: REQUEST_PERMISSIONS_SUCCESS,
          data: response,
          userID
        });
      },
      error(xhr) {
        Store.dispatch({
          type: REQUEST_PERMISSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID
        });
      }
    });
  }
};
