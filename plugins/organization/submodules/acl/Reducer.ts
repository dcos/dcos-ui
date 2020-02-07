import {
  ACL_RESOURCE_ACLS_CHANGE,
  ACL_SCHEMA_CHANGE
} from "./constants/EventTypes";

const SDK = require("../../SDK");

module.exports = (state = {}, action) => {
  if (action.__origin !== SDK.getSDK().pluginID) {
    return state;
  }

  switch (action.type) {
    case ACL_RESOURCE_ACLS_CHANGE:
      return {
        ...state,
        ...action.data
      };
    case ACL_SCHEMA_CHANGE:
      return {
        ...state,
        ...action.data
      };
    default:
      return state;
  }
};
