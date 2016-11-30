import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import Networking from '../../../../../../src/js/constants/Networking';

const defaultState = {
  type: Networking.type.HOST
};

let reducer = (state = defaultState, {type, path, value}) => {
  let joinedPath = path && path.join('.');
  let newState = Object.assign({}, state);

  if (type === SET && joinedPath === 'networking.type') {
    newState.type = value;
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
