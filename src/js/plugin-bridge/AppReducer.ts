import { APPLICATION } from "#SRC/js/constants/PluginConstants";
import { APP_STORE_CHANGE } from "../constants/EventTypes";

// Compute new state based on action
// NOTE: this is currently only ever called when the configstore sets a new config.
function updateState(prevState, action) {
  prevState[action.storeID] = action.data;

  return prevState;
}

// List of plugins with permissions to alter this state
const allowedToProceed = action =>
  [APPLICATION, "authentication", "organization"].includes(action.__origin);

// Clones state from application stores and maps it into the OmniStore
export default (state = {}, action) => {
  // Return early if the action didn't come from Application
  //  or plugins with permission
  if (!allowedToProceed(action)) {
    return state;
  }

  switch (action.type) {
    case APP_STORE_CHANGE:
      return updateState(state, action);
    default:
      return state;
  }
};
