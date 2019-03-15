import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { ERROR } from "#SRC/js/constants/TransactionTypes";

import PlacementConstraintsUtil from "../utils/PlacementConstraintsUtil";
import { PROP_MISSING_ONE, SYNTAX_ERROR } from "../constants/ServiceErrorTypes";

// &nbsp; to add empty validations
const NBSP = "\u00A0";

function checkDuplicateOperatorField(constraints) {
  if (!Array.isArray(constraints) || ValidatorUtil.isEmpty(constraints)) {
    return [];
  }

  const errors = [];
  const visitedOperatorFieldPairs = [];
  constraints.map(function(constraint, index) {
    if (
      !Array.isArray(constraint) &&
      !(constraint.operator && constraint.fieldName)
    ) {
      return;
    }
    const operatorFieldPair = constraint.operator
      ? { fieldName: constraint.fieldName, operator: constraint.operator }
      : { fieldName: constraint[0], operator: constraint[1] };
    const key = `{${operatorFieldPair.operator}}{${
      operatorFieldPair.fieldName
    }}`;

    if (visitedOperatorFieldPairs.includes(key)) {
      errors.push(
        ...[
          {
            path: ["constraints", index, "operator"],
            message: "Duplicate operator/field set",
            isPermissive: true
          },
          {
            path: ["constraints", index, "fieldName"],
            message: NBSP,
            isPermissive: true
          },
          {
            path: ["constraints", index, "value"],
            message: NBSP,
            isPermissive: true
          }
        ]
      );
    }
    visitedOperatorFieldPairs.push(key);
  });

  return errors;
}

const PlacementsValidators = {
  mustHaveUniqueOperatorField(app) {
    let constraints = findNestedPropertyInObject(app, "constraints");

    if (ValidatorUtil.isEmpty(constraints)) {
      constraints = findNestedPropertyInObject(
        app,
        "scheduling.placement.constraints"
      );
    }

    return checkDuplicateOperatorField(constraints);
  },
  validateConstraints(constraints) {
    if (constraints != null && !Array.isArray(constraints)) {
      return [
        {
          path: [],
          message: "constraints needs to be an array of 2 or 3 element arrays",
          type: "TYPE_NOT_ARRAY"
        }
      ];
    }

    const isRequiredMessage =
      "You must specify a value for operator {{operator}}";
    const isRequiredEmptyMessage =
      "Value must be empty for operator {{operator}}";
    const isStringNumberMessage =
      "Must only contain characters between 0-9 for operator {{operator}}";
    const variables = { name: "value" };

    return constraints.reduce((errors, constraint, index) => {
      if (!Array.isArray(constraint)) {
        errors.push({
          path: [index],
          message: "Must be an array",
          type: "TYPE_NOT_ARRAY"
        });

        return errors;
      }

      const [_fieldName, operator, value] = constraint;
      const isValueRequiredAndEmpty =
        PlacementConstraintsUtil.requiresValue(operator) &&
        ValidatorUtil.isEmpty(value);

      if (isValueRequiredAndEmpty) {
        errors.push({
          path: [index, "value"],
          message: isRequiredMessage.replace("{{operator}}", operator),
          type: PROP_MISSING_ONE,
          variables
        });
      }

      const isValueDefinedAndRequiredEmpty =
        PlacementConstraintsUtil.requiresEmptyValue(operator) &&
        !ValidatorUtil.isEmpty(value);

      if (isValueDefinedAndRequiredEmpty) {
        errors.push({
          path: [index, "value"],
          message: isRequiredEmptyMessage.replace("{{operator}}", operator),
          type: SYNTAX_ERROR,
          variables
        });
      }

      const isValueNotAStringNumberWhenRequired =
        PlacementConstraintsUtil.stringNumberValue(operator) &&
        !ValidatorUtil.isEmpty(value) &&
        !ValidatorUtil.isStringInteger(value);

      if (isValueNotAStringNumberWhenRequired) {
        errors.push({
          path: [index, "value"],
          message: isStringNumberMessage.replace("{{operator}}", operator),
          type: SYNTAX_ERROR,
          variables
        });
      }

      return errors;
    }, []);
  },

  validateNoBatchError(constraintTransactions) {
    const isErrorTransaction = transaction => transaction.type === ERROR;

    return !constraintTransactions.some(isErrorTransaction);
  }
};

export default PlacementsValidators;
