import { BOOTSTRAP_CONFIG_SUCCESS } from "./constants/EventTypes";

module.exports = (state = {}, action) => {
  switch (action.type) {
    case BOOTSTRAP_CONFIG_SUCCESS:
      return { ...state, ...action.bootstrapConfig };
    default:
      return state;
  }
};
