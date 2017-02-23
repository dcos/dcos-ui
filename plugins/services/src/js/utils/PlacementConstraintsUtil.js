import OperatorTypes from '../constants/OperatorTypes';

module.exports = {
  requiresValue(operator) {
    const constraintType = OperatorTypes[operator] || {};

    return constraintType.requiresValue;
  }
};
