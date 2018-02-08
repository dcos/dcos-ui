import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET,
  ERROR
} from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";

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
    !(requiresEmptyValue(newState[index].operator) && name === "value")
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
    if (!Array.isArray(constraints)) {
      return [new Transaction(["constraints"], "not-list", ERROR)];
    }

    return constraints.reduce(function(memo, item, index) {
      if (Array.isArray(item)) {
        memo.push(
          new Transaction(
            ["constraints", index, "value"],
            "value-not-converted-to-object",
            ERROR
          )
        );

        return memo;
      }

      if (typeof item != "object") {
        memo.push(
          new Transaction(
            ["constraints", index, "value"],
            "value-not-object",
            ERROR
          )
        );

        return memo;
      }

      if (item instanceof Error) {
        memo.push(
          new Transaction(["constraints", index, "value"], item.message, ERROR)
        );

        return memo;
      }

      const { fieldName, operator, value } = item;
      memo.push(new Transaction(["constraints"], null, ADD_ITEM));
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
