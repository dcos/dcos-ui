import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";
import * as C from "./common/Constraints";

export const FormReducer = C.FormReducer;
export function JSONReducer(state, transaction) {
  const constraints = C.JSONReducer.bind(this)(state, transaction);

  return constraints.map(({ fieldName, operator, value }) => {
    if (!isEmpty(value)) {
      return { fieldName, operator, value };
    }

    return { fieldName, operator };
  });
}

export function JSONParser(state) {
  const constraints = findNestedPropertyInObject(
    state,
    "scheduling.placement.constraints"
  );

  if (constraints == null) {
    return [];
  }

  return C.JSONParser(constraints);
}
