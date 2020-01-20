import { RequestUtil } from "mesosphere-shared-reactjs";

import Config from "#SRC/js/config/Config";
import {
  REQUEST_PERMISSIONS_ERROR,
  REQUEST_PERMISSIONS_SUCCESS
} from "../constants/ActionTypes";

const SDK = require("../SDK");

const ACLAuthenticatedUserActions = {
  fetchPermissions(userID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}/permissions`,
      success(response) {
        SDK.getSDK().dispatch({
          type: REQUEST_PERMISSIONS_SUCCESS,
          data: response,
          userID
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_PERMISSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID
        });
      }
    });
  }
};

export default ACLAuthenticatedUserActions;
