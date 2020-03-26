import { RequestUtil } from "mesosphere-shared-reactjs";
import { request } from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import Util from "#SRC/js/utils/Util";
import * as ActionTypes from "../constants/ActionTypes";

import SDK from "PluginSDK";

const ACLGroupsActions = {
  fetch() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups`,
      success(response) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUPS_SUCCESS,
          data: response.array,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUPS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
        });
      },
    });
  },

  fetchGroup(groupID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}`,
      success(response) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_SUCCESS,
          data: response,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
        });
      },
    });
  },

  fetchGroupPermissions(groupID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}/permissions`,
      success(response) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_PERMISSIONS_SUCCESS,
          data: response.array,
          groupID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_PERMISSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
        });
      },
    });
  },

  fetchGroupUsers(groupID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}/users`,
      success(response) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_USERS_SUCCESS,
          data: response.array,
          groupID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_USERS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
        });
      },
    });
  },

  fetchGroupServiceAccounts(groupID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}/users?type=service`,
      success(response) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_SUCCESS,
          data: response.array,
          groupID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
        });
      },
    });
  },

  addGroup(data) {
    let groupID = data.gid;
    data = Util.omit(data, "gid");

    if (!groupID && data.description) {
      groupID = data.description.replace(/\s+/g, "").toLowerCase();
    }

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}`,
      method: "PUT",
      data,
      success() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_CREATE_SUCCESS,
          groupID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
        });
      },
    });
  },

  addLDAPGroup(data) {
    request(`${Config.rootUrl}${Config.acsAPIPrefix}/ldap/importgroup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).subscribe({
      next: ({ code, response }) => {
        if (code === 202) {
          SDK.dispatch({
            type: ActionTypes.REQUEST_ACL_LDAP_GROUP_CREATE_PARTIAL_SUCCESS,
            groupID: data.groupname,
            data: {
              importedUserCount: response.imported_user_count,
            },
          });
        } else {
          SDK.dispatch({
            type: ActionTypes.REQUEST_ACL_LDAP_GROUP_CREATE_SUCCESS,
            groupID: data.groupname,
          });
        }
      },
      error: (error) => {
        const { code, response } = error;
        const codeType = code ? code.toString().charAt(0) : "0";
        const defaultError = `Could not import group. Are you sure this group exists?
        Is the LDAP server running? Please contact your cluster administrator.`;
        const description =
          response && response.description
            ? response.description
            : defaultError;

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_LDAP_GROUP_CREATE_ERROR,
          data: codeType === "4" ? description : defaultError,
          groupID: data.groupname,
        });
      },
    });
  },

  updateGroup(groupID, patchData) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}`,
      method: "PATCH",
      data: patchData,
      success() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_UPDATE_SUCCESS,
          groupID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_UPDATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
        });
      },
    });
  },

  deleteGroup(groupID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}`,
      method: "DELETE",
      success() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_DELETE_SUCCESS,
          groupID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
        });
      },
    });
  },

  addUser(groupID, userID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}/users/${userID}`,
      method: "PUT",
      success() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_ADD_USER_SUCCESS,
          groupID,
          userID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_ADD_USER_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
          userID,
        });
      },
    });
  },

  deleteUser(groupID, userID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/groups/${groupID}/users/${userID}`,
      method: "DELETE",
      success() {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_SUCCESS,
          groupID,
          userID,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          groupID,
          userID,
        });
      },
    });
  },
};

if (Config.useFixtures) {
  const groupFixture = import(
    "../../../../../tests/_fixtures/acl/group-unicode.json"
  );
  const groupDetailsFixture = import(
    "../../../../../tests/_fixtures/acl/group-with-details.json"
  );
  const groupsFixture = import(
    "../../../../../tests/_fixtures/acl/groups-unicode.json"
  );

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  Promise.all([groupsFixture, groupFixture, groupDetailsFixture]).then(
    (responses) => {
      window.actionTypes.ACLGroupsActions = {
        fetch: { event: "success", success: { response: responses[0] } },
        fetchGroup: { event: "success", success: { response: responses[1] } },
        fetchGroupPermissions: {
          event: "success",
          success: {
            response: responses[2].permissions,
          },
        },
        fetchGroupUsers: {
          event: "success",
          success: {
            response: responses[2].users,
          },
        },
        addGroup: { event: "success" },
        addLDAPGroup: { event: "success" },
        updateGroup: { event: "success" },
        deleteGroup: { event: "success" },
        addUser: { event: "success" },
        deleteUser: { event: "success" },
      };

      Object.keys(window.actionTypes.ACLGroupsActions).forEach((method) => {
        ACLGroupsActions[method] = RequestUtil.stubRequest(
          ACLGroupsActions,
          "ACLGroupsActions",
          method
        );
      });
    }
  );
}

export default ACLGroupsActions;
