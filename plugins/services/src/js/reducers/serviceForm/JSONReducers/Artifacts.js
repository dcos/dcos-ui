import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";

function getJson(data) {
  return data.filter(({ uri }) => !isEmpty(uri));
}

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
  JSONParser(state) {
    if (state.fetch == null) {
      return [];
    }

    return state.fetch.reduce(function(memo, item, index) {
      memo.push(new Transaction(["fetch"], item, ADD_ITEM));
      Object.keys(item).forEach(function(key) {
        memo.push(new Transaction(["fetch", index, key], item[key], SET));
      });

      return memo;
    }, []);
  },

  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    if (this.fetch == null) {
      this.fetch = [];
    }

    this.fetch = processTransaction(this.fetch, { type, path, value });

    return getJson(this.fetch);
  }
};
