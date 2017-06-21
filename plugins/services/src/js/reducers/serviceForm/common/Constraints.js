import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from "../../../../../../../src/js/constants/TransactionTypes";
import Transaction from "../../../../../../../src/js/structs/Transaction";
import { requiresEmptyValue } from "../../../utils/PlacementConstraintsUtil";
import { isEmpty } from "../../../../../../../src/js/utils/ValidatorUtil";

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
  JSONParser(constraints) {
    // Ignore non-array constraints
    if (!Array.isArray(constraints)) {
      return [];
    }

    return constraints.reduce(function(memo, item, index) {
      if (typeof item !== "object") {
        return memo;
      }

      const { fieldName, operator, value } = item;
      memo.push(new Transaction(["constraints"], index, ADD_ITEM));
      memo.push(
        new Transaction(["constraints", index, "fieldName"], fieldName, SET)
      );
      memo.push(
        new Transaction(["constraints", index, "operator"], operator, SET)
      );

      // Skip if value is not set
      if (value != null) {
        memo.push(new Transaction(["constraints", index, "value"], value, SET));
      }

      return memo;
    }, []);
  },

  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }
    if (this.constraints == null) {
      this.constraints = [];
    }

    this.constraints = processTransaction(this.constraints, {
      type,
      path,
      value
    });

    return this.constraints
      .filter(function(item = {}) {
        return !isEmpty(item.fieldName) && !isEmpty(item.operator);
      })
      .map(function({ fieldName, operator, value }) {
        return {
          fieldName,
          value,
          operator: operator.toUpperCase()
        };
      });
  },

  FormReducer(state = [], { type, path, value }) {
    if (path == null || !Array.isArray(state)) {
      return state;
    }

    return processTransaction(state, { type, path, value });
  }
};
