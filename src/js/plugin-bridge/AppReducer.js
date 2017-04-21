import { APP_STORE_CHANGE } from "../constants/EventTypes";
import { APPLICATION } from "../constants/PluginConstants";
import StructUtil from "../utils/StructUtil";

const initialState = {};
// List of plugins with permissions to alter this state
const PERMISSIONS_LIST = [APPLICATION, "authentication", "organization"];

// Compute new state based on action
function updateState(prevState, action) {
  // Peel away Structs and assign to State tree rooted at storeID
  prevState[action.storeID] = StructUtil.copyRawObject(action.data);

  return prevState;
}

function allowedToProceed(action) {
  return PERMISSIONS_LIST.indexOf(action.__origin) > -1;
}

// Clones state from application stores and maps it into the OmniStore
module.exports = function(state = initialState, action) {
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
