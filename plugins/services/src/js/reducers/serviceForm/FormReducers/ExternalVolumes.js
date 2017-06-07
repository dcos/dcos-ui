import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import { parseIntValue } from "#SRC/js/utils/ReducerUtil";

module.exports = {
  FormReducer(state = [], { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");

    if (path[0] === "externalVolumes") {
      if (joinedPath === "externalVolumes") {
        switch (type) {
          case ADD_ITEM:
            const defaultVolume = {
              containerPath: null,
              name: null,
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray"
              },
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

      const index = path[1];
      if (type === SET && `externalVolumes.${index}.provider` === joinedPath) {
        state[index].provider = String(value);
      }
      if (type === SET && `externalVolumes.${index}.options` === joinedPath) {
        // Options is of type object, so we are not processing it
        state[index].options = value;
      }
      if (type === SET && `externalVolumes.${index}.name` === joinedPath) {
        state[index].name = String(value);
      }
      if (
        type === SET &&
        `externalVolumes.${index}.containerPath` === joinedPath
      ) {
        state[index].containerPath = String(value);
      }
      if (type === SET && `externalVolumes.${index}.size` === joinedPath) {
        state[index].size = parseIntValue(value);
      }
      if (type === SET && `externalVolumes.${index}.mode` === joinedPath) {
        state[index].mode = String(value);
      }
    }

    return state;
  }
};
