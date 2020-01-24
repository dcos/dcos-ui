import { RequestUtil } from "mesosphere-shared-reactjs";

import Config from "#SRC/js/config/Config";
import {
  REQUEST_ACL_USER_SUCCESS,
  REQUEST_ACL_USER_ERROR,
  REQUEST_ACL_USER_GROUPS_SUCCESS,
  REQUEST_ACL_USER_GROUPS_ERROR,
  REQUEST_ACL_USER_PERMISSIONS_SUCCESS,
  REQUEST_ACL_USER_PERMISSIONS_ERROR,
  REQUEST_ACL_LDAP_USER_CREATE_SUCCESS,
  REQUEST_ACL_LDAP_USER_CREATE_ERROR,
  REQUEST_ACL_USER_UPDATE_SUCCESS,
  REQUEST_ACL_USER_UPDATE_ERROR
} from "../constants/ActionTypes";

const SDK = require("../../../SDK");

const ACLUsersActions = {
  fetchUser(userID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}`,
      success(response) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID
        });
      }
    });
  },

  fetchUserGroups(userID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}/groups`,
      success(response) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_GROUPS_SUCCESS,
          data: response.array,
          userID
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_GROUPS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID
        });
      }
    });
  },

  fetchUserPermissions(userID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}/permissions`,
      success(response) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_PERMISSIONS_SUCCESS,
          data: response,
          userID
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_PERMISSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID
        });
      }
    });
  },

  addLDAPUser(data) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/importuser`,
      method: "POST",
      data,
      success() {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_LDAP_USER_CREATE_SUCCESS,
          userID: data.username
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_LDAP_USER_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID: data.username
        });
      }
    });
  },

  updateUser(userID, patchData) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}`,
      method: "PATCH",
      data: patchData,
      success() {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_UPDATE_SUCCESS,
          userID
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_UPDATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const userFixture = import(
    /* userFixture */ "../../../../../tests/_fixtures/acl/user-unicode.json"
  );
  const userDetailsFixture = import(
    /* userDetailsFixture */ "../../../../../tests/_fixtures/acl/user-with-details.json"
  );

  if (!window.actionTypes) {
    window.actionTypes = {};
  }
  Promise.all([userFixture, userDetailsFixture]).then(responses => {
    window.actionTypes.ACLUsersActions = {
      fetchUser: { event: "success", success: { response: responses[0] } },
      fetchUserGroups: {
        event: "success",
        success: {
          response: responses[1].groups
        }
      },
      fetchUserPermissions: {
        event: "success",
        success: {
          response: responses[1].permissions
        }
      },
      updateUser: { event: "success" }
    };

    Object.keys(window.actionTypes.ACLUsersActions).forEach(method => {
      ACLUsersActions[method] = RequestUtil.stubRequest(
        ACLUsersActions,
        "ACLUsersActions",
        method
      );
    });
  });
}

export default ACLUsersActions;
