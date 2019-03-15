import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";

export default {
  FormReducer(state = [], { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("labels") !== -1) {
      if (joinedPath === "labels") {
        switch (type) {
          case ADD_ITEM:
            state.push({ key: null, value: null });
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return state;
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET && `labels.${index}.key` === joinedPath) {
        state[index].key = value;
      }
      if (type === SET && `labels.${index}.value` === joinedPath) {
        state[index].value = value;
      }
    }

    return state;
  }
};
