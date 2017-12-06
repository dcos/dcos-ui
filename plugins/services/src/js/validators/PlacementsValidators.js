import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import PlacementConstraintsUtil from "../utils/PlacementConstraintsUtil";
import { PROP_MISSING_ONE, SYNTAX_ERROR } from "../constants/ServiceErrorTypes";

function checkDuplicateOperatorField(constraints) {
  if (!constraints || ValidatorUtil.isEmpty(constraints)) {
    return [];
  }

  const uniques = [];
  const duplicates = [];
  constraints.forEach(function(item, index) {
    item = "operator" in item
      ? item
      : { fieldName: item[0], operator: item[1] };

    const isPresent = uniques.filter(function(elem) {
      return (
        elem.fieldName === item.fieldName && elem.operator === item.operator
      );
    });
    if (isPresent.length === 0) {
      uniques.push(item);
    } else {
      duplicates.push({
        operator: item.operator,
        field: item.fieldName,
        index
      });
    }
  });

  return duplicates.map(function(duplicate) {
    return {
      path: ["constraints", duplicate.index, "fieldName"],
      message: "Duplicate operator/ field set"
    };
  });
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
          message: "constrains needs to be an array of 2 or 3 element arrays",
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
  }
};

module.exports = PlacementsValidators;
