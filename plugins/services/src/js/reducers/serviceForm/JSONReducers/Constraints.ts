import { ERROR } from "#SRC/js/constants/TransactionTypes";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Transaction from "#SRC/js/structs/Transaction";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";
import {
  JSONParser as parser,
  JSONReducer as reducer,
} from "../common/Constraints";

export function JSONReducer(state, transaction) {
  const constraints = reducer.bind(this)(state, transaction);

  return constraints.map(({ fieldName, operator, value }) => {
    if (!isEmpty(value)) {
      return [fieldName, operator, value];
    }

    return [fieldName, operator];
  });
}

export function JSONParser(state) {
  const constraints = findNestedPropertyInObject(state, "constraints") || [];

  if (!Array.isArray(constraints)) {
    return [new Transaction(["constraints"], "not-list", ERROR)];
  }

  return parser(
    constraints.reduce((memo, constraint) => {
      if (constraint == null) {
        return memo;
      }

      if (!Array.isArray(constraint)) {
        memo.push(new Error("value-is-malformed"));

        return memo;
      }
      const [fieldName, operator, value] = constraint;
      memo.push({ fieldName, operator, value });

      return memo;
    }, [])
  );
}
