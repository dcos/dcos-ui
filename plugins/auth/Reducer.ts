import { ACL_AUTH_USER_PERMISSIONS_CHANGED } from "./constants/EventTypes";

const SDK = require("./SDK");

const initialState = {
  permissions: { direct: [], groups: [] }
};

module.exports = (state = initialState, action) => {
  if (action.__origin !== SDK.getSDK().pluginID) {
    return state;
  }
  switch (action.type) {
    case ACL_AUTH_USER_PERMISSIONS_CHANGED:
      return {
        ...state,
        permissions: action.permissions
      };

    default:
      return state;
  }
};
