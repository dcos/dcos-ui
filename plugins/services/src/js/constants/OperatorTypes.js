const OperatorTypes = {
  types: {
    UNIQUE: 'UNIQUE',
    CLUSTER: 'CLUSTER',
    GROUP_BY: 'GROUP_BY',
    LIKE: 'LIKE',
    UNLIKE: 'UNLIKE',
    MAX_PER: 'MAX_PER'
  },
  isRequired: {
    UNIQUE: false,
    CLUSTER: true,
    GROUP_BY: false,
    LIKE: true,
    UNLIKE: true,
    MAX_PER: true
  },
  hasThirdField: {
    UNIQUE: false,
    CLUSTER: true,
    GROUP_BY: false,
    LIKE: true,
    UNLIKE: true,
    MAX_PER: true
  }
};

module.exports = OperatorTypes;
