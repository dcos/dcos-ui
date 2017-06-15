import {
  findNestedPropertyInObject
} from "../../../../../../src/js/utils/Util";
import { isEmpty } from "../../../../../../src/js/utils/ValidatorUtil";
import { FormReducer, JSONParser, JSONReducer } from "./common/Constraints";

module.exports = {
  FormReducer,
  JSONReducer(state, transaction) {
    const constraints = JSONReducer.bind(this)(state, transaction);

    return constraints.map(function({ fieldName, operator, value }) {
      if (!isEmpty(value)) {
        return { fieldName, operator, value };
      }

      return { fieldName, operator };
    });
  },

  JSONParser(state) {
    const constraints = findNestedPropertyInObject(
      state,
      "scheduling.placement.constraints"
    );

    return JSONParser(constraints);
  }
};
