import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import Networking from '../../../../../../src/js/constants/Networking';

const defaultState = {
  type: Networking.type.HOST
};

// TODO: This is taking place of the reducer's context since this reducer does
// not make use of the combinedReducer method.
let appState = {
  hasContainer: false
};

let reducer = (state = defaultState, {type, path, value}) => {
  let joinedPath = path && path.join('.');
  let newState = Object.assign({}, state);

  if (joinedPath === 'container.docker.image' && !!value) {
    appState.hasContainer = true;
  }

  if (type === SET && joinedPath === 'networking.type') {
    newState.type = value;
  }

  if (joinedPath === 'networking.type' && !appState.hasContainer) {
    newState.type = Networking.type.HOST;
  }

  return newState;
};

module.exports = {
  JSONReducer: () => {
    // We don't want the `networking` key in the app config; it is only used
    // to influence other aspects of the configuration.
    return null;
  },

  JSONParser(state) {
    if (state.env == null) {
      return [];
    }

    return state;
  },

  FormReducer: reducer
};
