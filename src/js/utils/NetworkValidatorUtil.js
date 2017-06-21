import ValidatorUtil from "./ValidatorUtil";

const NetworkValidatorUtil = {
  isValidPort(value) {
    return (
      ValidatorUtil.isInteger(value) &&
      ValidatorUtil.isNumberInRange(value, { min: 1, max: 65535 })
    );
  }
};

module.exports = NetworkValidatorUtil;
