const OperatorTypes = {
  UNIQUE: {
    requiresValue: false
  },
  CLUSTER: {
    requiresValue: true
  },
  GROUP_BY: {
    requiresValue: false
  },
  LIKE: {
    requiresValue: true
  },
  UNLIKE: {
    requiresValue: true
  },
  MAX_PER: {
    requiresValue: true
  }
};

module.exports = OperatorTypes;
