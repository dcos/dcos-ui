import { ACL_DIRECTORIES_CHANGED } from "./constants/EventTypes";

const SDK = require("../../SDK");

const initialState = { list: [] };

module.exports = (state = initialState, action) => {
  if (action.__origin !== SDK.getSDK().pluginID) {
    return state;
  }

  switch (action.type) {
    case ACL_DIRECTORIES_CHANGED:
      return {
        ...state,
        list: action.directories
      };
    default:
      return state;
  }
};
