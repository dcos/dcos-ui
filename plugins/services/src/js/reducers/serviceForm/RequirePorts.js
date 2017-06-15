import { SET } from "../../../../../../src/js/constants/TransactionTypes";
import Transaction from "../../../../../../src/js/structs/Transaction";

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
