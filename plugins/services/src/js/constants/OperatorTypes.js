const OperatorTypes = {
  UNIQUE: {
    requiresValue: false,
    requiresEmptyValue: true,
    stringNumberValue: false
  },
  CLUSTER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false
  },
  GROUP_BY: {
    requiresValue: false,
    requiresEmptyValue: false,
    stringNumberValue: true
  },
  LIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false
  },
  UNLIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false
  },
  MAX_PER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: true
  }
};

module.exports = OperatorTypes;
