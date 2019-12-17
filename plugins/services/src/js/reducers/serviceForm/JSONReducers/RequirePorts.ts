import { SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

export function JSONReducer(state, { path, type, value }) {
  const [base] = path;

  if (base === "portsAutoAssign" && type === SET) {
    return !value;
  }

  return state;
}

export function JSONParser(state) {
  return new Transaction(["portsAutoAssign"], !state.requirePorts);
}
