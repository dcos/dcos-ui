import OperatorTypes from "../constants/OperatorTypes";

export default {
  requiresValue(operator) {
    const constraintType = OperatorTypes[operator] || {};

    return constraintType.requiresValue;
  },

  stringNumberValue(operator) {
    const constraintType = OperatorTypes[operator] || {};

    return constraintType.stringNumberValue;
  },

  requiresEmptyValue(operator) {
    const constraintType = OperatorTypes[operator] || {};

    return constraintType.requiresEmptyValue;
  }
};
