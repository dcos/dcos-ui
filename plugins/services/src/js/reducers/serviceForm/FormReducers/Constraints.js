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
    let defaultValue = { fieldName: null, operator: null, value: null };

    if (value != null && value.type != null) {
      defaultValue = Object.assign({}, defaultValue, value);
    }

    newState.push(defaultValue);
  }

  if (type === REMOVE_ITEM) {
    newState = newState.filter((item, index) => {
      return index !== value;
    });
  }

  if (type === SET && name === "type") {
    newState[index].type = value;
  }

  if (
    type === SET &&
    CONSTRAINT_FIELDS.includes(name) &&
    !(requiresEmptyValue(newState[index].operator) && name === "value")
  ) {
    newState[index][name] = value;
  }

  if (name === "operator" && requiresEmptyValue(value)) {
    newState[index].value = null;
  }

  return newState;
}

export default {
  FormReducer(state = [], { type, path, value }) {
    if (path == null || !Array.isArray(state)) {
      return state;
    }

    return processTransaction(state, { type, path, value });
  }
};
