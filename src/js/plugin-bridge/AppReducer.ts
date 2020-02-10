import { APP_STORE_CHANGE } from "../constants/EventTypes";

// Compute new state based on action
// NOTE: this is currently only ever called when the configstore sets a new config.
function updateState(prevState, action) {
  prevState[action.storeID] = action.data;

  return prevState;
}

// Clones state from application stores and maps it into the OmniStore
export default (state = {}, action) => {
  switch (action.type) {
    case APP_STORE_CHANGE:
      return updateState(state, action);
    default:
      return state;
  }
};
