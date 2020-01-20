import { RequestUtil } from "mesosphere-shared-reactjs";

import Config from "#SRC/js/config/Config";
import getFixtureResponses from "#SRC/js/utils/getFixtureResponses";
import {
  REQUEST_ACL_CREATE_ERROR,
  REQUEST_ACL_CREATE_SUCCESS,
  REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
  REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
  REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
  REQUEST_ACL_RESOURCE_ACLS_ERROR,
  REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
  REQUEST_ACL_SCHEMA_ERROR,
  REQUEST_ACL_SCHEMA_SUCCESS,
  REQUEST_ACL_USER_GRANT_ACTION_ERROR,
  REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
  REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS
} from "../constants/ActionTypes";

const SDK = require("../../../SDK");

function encodeSlashes(string) {
  return string.replace(/\//g, "%252F");
}

const ACLActions = {
  createACLForResource(resourceID, data) {
    const encodedResource = encodeSlashes(resourceID);
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/acls/${encodedResource}`,
      method: "PUT",
      data,
      success() {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_CREATE_SUCCESS,
          resourceID
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          resourceID
        });
      }
    });
  },

  fetchACLs(resourceType) {
    let query = "";
    if (resourceType) {
      query = `?type=${resourceType}`;
    }

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/acls${query}`,
      success(response) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          data: response.array,
          resourceType
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_RESOURCE_ACLS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          resourceType
        });
      }
    });
  },

  fetchACLSchema() {
    RequestUtil.json({
      // Not part of the actual API, just a file being served
      url: `${Config.rootUrl}/acs/acl-schema.json`,
      success(response) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_SCHEMA_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_SCHEMA_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  grantUserActionToResource(userID, action, resourceID) {
    const encodedResource = encodeSlashes(resourceID);
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/acls/${encodedResource}/users/${userID}/${action}`,
      method: "PUT",
      success() {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
          triple: { userID, action, resourceID }
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_GRANT_ACTION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          triple: { userID, action, resourceID },
          xhr
        });
      }
    });
  },

  revokeUserActionToResource(userID, action, resourceID) {
    const encodedResource = encodeSlashes(resourceID);
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/acls/${encodedResource}/users/${userID}/${action}`,
      method: "DELETE",
      success() {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
          triple: { userID, action, resourceID }
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          triple: { userID, action, resourceID }
        });
      }
    });
  },

  grantGroupActionToResource(groupID, action, resourceID) {
    const encodedResource = encodeSlashes(resourceID);
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/acls/${encodedResource}/groups/${groupID}/${action}`,
      method: "PUT",
      success() {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
          triple: { groupID, action, resourceID }
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          triple: { groupID, action, resourceID },
          xhr
        });
      }
    });
  },

  revokeGroupActionToResource(groupID, action, resourceID) {
    const encodedResource = encodeSlashes(resourceID);
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/acls/${encodedResource}/groups/${groupID}/${action}`,
      method: "DELETE",
      success() {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
          triple: { groupID, action, resourceID }
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          triple: { groupID, action, resourceID }
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const methodFixtureMapping = {
    fetchACLs: import(
      /* aclsFixture */ "../../../../../tests/_fixtures/acl/acls-unicode.json"
    ),
    fetchACLSchema: import(
      /* aclSchema */ "../../../../../tests/_fixtures/acl/acl-schema.json"
    )
  };

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  Promise.all(
    Object.keys(methodFixtureMapping).map(
      method => methodFixtureMapping[method]
    )
  ).then(responses => {
    window.actionTypes.ACLActions = Object.assign(
      getFixtureResponses(methodFixtureMapping, responses),
      {
        grantUserActionToResource: { event: "success" },
        revokeUserActionToResource: { event: "success" },
        grantGroupActionToResource: { event: "success" },
        revokeGroupActionToResource: { event: "success" }
      }
    );

    Object.keys(window.actionTypes.ACLActions).forEach(method => {
      ACLActions[method] = RequestUtil.stubRequest(
        ACLActions,
        "ACLActions",
        method
      );
    });
  });
}

export default ACLActions;
