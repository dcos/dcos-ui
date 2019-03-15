import { ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";

export default {
  JSONReducer(state = [], { type, path, value }) {
    const [base, index, name, secondIndex] = path;

    let newState = state.slice();

    if (base === "containers") {
      switch (type) {
        case ADD_ITEM:
          newState = newState.map(volumeMount => {
            volumeMount.mountPath.push("");

            return volumeMount;
          });
          break;
        case REMOVE_ITEM:
          newState = newState.map(volumeMount => {
            volumeMount.mountPath = volumeMount.mountPath.filter(
              (item, index) => index !== value
            );

            return volumeMount;
          });
          break;
      }
    }

    if (base !== "volumeMounts") {
      return newState;
    }

    switch (type) {
      case ADD_ITEM:
        newState.push({ mountPath: [] });
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => index !== value);
        break;
    }

    if (name === "name") {
      newState[index].name = String(value);
    }
    if (name === "mountPath") {
      newState[index].mountPath[secondIndex] = String(value);
    }

    return newState;
  }
};
