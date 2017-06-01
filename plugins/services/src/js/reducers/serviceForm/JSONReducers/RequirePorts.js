import { SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

module.exports = {
  JSONReducer(state, { path, type, value }) {
    const [base] = path;

    if (base === "portsAutoAssign" && type === SET) {
      return !value;
    }

    return state;
  },

  JSONParser(state) {
    return new Transaction(["portsAutoAssign"], !state.requirePorts);
  }
};
