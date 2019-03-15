import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import { parseIntValue } from "#SRC/js/utils/ReducerUtil";

export default {
  FormReducer(state = [], { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("volumes") !== -1) {
      if (joinedPath === "volumes") {
        switch (type) {
          case ADD_ITEM:
            const defaultVolume = {
              containerPath: null,
              size: null,
              profileName: null,
              mode: "RW"
            };
            state.push(Object.assign({}, value || defaultVolume));
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
      if (type === SET && `volumes.${index}.type` === joinedPath) {
        state[index].type = String(value);
      }
      if (type === SET && `volumes.${index}.size` === joinedPath) {
        state[index].size = parseIntValue(value);
      }
      if (type === SET && `volumes.${index}.profileName` === joinedPath) {
        state[index].profileName = String(value);
      }
      if (type === SET && `volumes.${index}.name` === joinedPath) {
        state[index].name = String(value);
      }
      if (type === SET && `volumes.${index}.mode` === joinedPath) {
        state[index].mode = String(value);
      }
      if (type === SET && `volumes.${index}.containerPath` === joinedPath) {
        state[index].containerPath = String(value);
      }
      if (type === SET && `volumes.${index}.hostPath` === joinedPath) {
        state[index].hostPath = String(value);
      }
    }

    return state;
  }
};
