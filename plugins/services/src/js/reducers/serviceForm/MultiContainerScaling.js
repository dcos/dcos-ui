import { SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

module.exports = {
  JSONReducer(state = null, { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");
    if (this.internalState == null) {
      this.internalState = {
        instances: 1,
        kind: "fixed"
      };
    }

    if (type === SET && joinedPath === "instances") {
      this.internalState.instances = parseInt(value, 10) || 0;

      return this.internalState;
    }

    if (type === SET && joinedPath === "scaling.kind") {
      this.internalState.kind = value;
      if (this.internalState.instances == null) {
        return null;
      }

      return this.internalState;
    }

    return state;
  },

  JSONParser(state) {
    if (state.scaling == null) {
      return [];
    }

    const transactions = [];
    if (Number.isInteger(state.scaling.instances)) {
      transactions.push(
        new Transaction(["instances"], state.scaling.instances)
      );
    }
    if (state.scaling.kind) {
      transactions.push(
        new Transaction(["scaling", "kind"], state.scaling.kind)
      );
    }

    return transactions;
  }
};
