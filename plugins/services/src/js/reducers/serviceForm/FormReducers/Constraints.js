import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import { requiresEmptyValue } from "../../../utils/PlacementConstraintsUtil";

const CONSTRAINT_FIELDS = ["fieldName", "operator", "value"];

function processTransaction(state, { type, path, value }) {
  const [fieldName, index, name] = path;

  if (fieldName !== "constraints") {
    return state;
  }

  let newState = state.slice();

  if (type === ADD_ITEM) {
    newState.push({ fieldName: null, operator: null, value: null });
  }
  if (type === REMOVE_ITEM) {
    newState = newState.filter((item, index) => {
      return index !== value;
    });
  }
  if (
    type === SET &&
    CONSTRAINT_FIELDS.includes(name) &&
    !requiresEmptyValue(newState[index].operator)
  ) {
    newState[index][name] = value;
  }

  if (name === "operator" && requiresEmptyValue(value)) {
    newState[index].value = null;
  }

  return newState;
}

module.exports = {
  FormReducer(state = [], { type, path, value }) {
    if (path == null || !Array.isArray(state)) {
      return state;
    }

    return processTransaction(state, { type, path, value });
  }
};
