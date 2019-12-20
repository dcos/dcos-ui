import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";

export function FormReducer(state = [], { type, path, value }) {
  if (path == null) {
    return state;
  }

  const joinedPath = path.join(".");

  if (joinedPath.search("env") !== -1) {
    if (joinedPath === "env") {
      switch (type) {
        case ADD_ITEM:
          state.push({ key: null, value: null });
          break;
        case REMOVE_ITEM:
          state = state.filter((item, index) => index !== value);
          break;
      }

      return state;
    }

    const index = joinedPath.match(/\d+/)[0];
    if (type === SET && `env.${index}.key` === joinedPath) {
      state[index].key = value;
    }
    if (type === SET && `env.${index}.value` === joinedPath) {
      state[index].value = value;
    }
  }

  return state;
}
