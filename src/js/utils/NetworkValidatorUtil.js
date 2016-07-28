import ValidatorUtil from './ValidatorUtil';

const NetworkValidatorUtil = {
  isValidPort(value) {
    return ValidatorUtil.isInteger(value) &&
      ValidatorUtil.isNumberInRange(value, {max: 65535});
  }
};

module.exports = NetworkValidatorUtil;
