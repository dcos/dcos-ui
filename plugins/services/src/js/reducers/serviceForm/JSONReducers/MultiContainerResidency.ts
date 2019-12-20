import { SET } from "#SRC/js/constants/TransactionTypes";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Transaction from "#SRC/js/structs/Transaction";

export function JSONReducer(state, { type, path, value }) {
  if (path == null) {
    return state;
  }

  if (this.volumeMounts == null) {
    this.volumeMounts = [];
  }

  const joinedPath = path.join(".");

  if (type === SET && joinedPath === "residency") {
    this.residency = value;

    return value;
  }

  return state;
}
export function JSONParser(state) {
  const residency = findNestedPropertyInObject(state, "scheduling.residency");
  if (residency == null) {
    return [];
  }

  return new Transaction(["residency"], residency);
}
