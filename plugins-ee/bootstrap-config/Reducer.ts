import { BOOTSTRAP_CONFIG_SUCCESS } from "./constants/EventTypes";

const SDK = require("./SDK");

module.exports = (state = {}, action) => {
  if (action.__origin !== SDK.getSDK().pluginID) {
    return state;
  }

  switch (action.type) {
    case BOOTSTRAP_CONFIG_SUCCESS:
      return {
        ...state,
        ...action.bootstrapConfig
      };
    default:
      return state;
  }
};
