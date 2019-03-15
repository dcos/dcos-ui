import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";

function processTransaction(state, { type, path, value }) {
  const [field, index, name] = path;

  if (field !== "fetch") {
    return state;
  }

  let newState = state.slice();

  if (type === ADD_ITEM) {
    newState.push(value || { uri: null });
  }

  if (type === REMOVE_ITEM) {
    newState = newState.filter((item, index) => {
      return index !== value;
    });
  }

  if (type === SET && index != null && name != null) {
    newState[index][name] = value;
  }

  return newState;
}

export default {
  FormReducer(state = [], { type, path, value }) {
    if (path == null) {
      return state;
    }

    state = processTransaction(state, { type, path, value });

    return state;
  }
};
