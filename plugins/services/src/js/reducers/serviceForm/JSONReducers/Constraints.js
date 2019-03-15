import { ERROR } from "#SRC/js/constants/TransactionTypes";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Transaction from "#SRC/js/structs/Transaction";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";
import Constraints from "../common/Constraints";

const { JSONParser, JSONReducer } = Constraints;

export default {
  JSONReducer(state, transaction) {
    const constraints = JSONReducer.bind(this)(state, transaction);

    return constraints.map(function({ fieldName, operator, value }) {
      if (!isEmpty(value)) {
        return [fieldName, operator, value];
      }

      return [fieldName, operator];
    });
  },

  JSONParser(state) {
    const constraints = findNestedPropertyInObject(state, "constraints") || [];

    if (!Array.isArray(constraints)) {
      return [new Transaction(["constraints"], "not-list", ERROR)];
    }

    return JSONParser(
      constraints.reduce(function(memo, constraint) {
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
};
