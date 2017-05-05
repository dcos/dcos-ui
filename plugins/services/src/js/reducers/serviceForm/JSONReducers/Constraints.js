import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";
import { JSONParser, JSONReducer } from "../common/Constraints";

module.exports = {
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
      return [];
    }

    return JSONParser(
      constraints.reduce(function(memo, constraint) {
        if (!Array.isArray(constraint)) {
          return memo;
        }
        const [fieldName, operator, value] = constraint;
        memo.push({ fieldName, operator, value });

        return memo;
      }, [])
    );
  }
};
