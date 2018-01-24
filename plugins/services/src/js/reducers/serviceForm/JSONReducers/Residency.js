import { SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

module.exports = {
  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");

    if (type === SET && joinedPath === "residency") {
      this.residency = value;

      return value;
    }

    return state;
  },
  JSONParser(state) {
    if (state.residency == null) {
      return [];
    }

    return new Transaction(["residency"], state.residency);
  }
};
