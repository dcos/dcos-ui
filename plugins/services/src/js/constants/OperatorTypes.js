const OperatorTypes = {
  UNIQUE: {
    requiresValue: false,
    requiresEmptyValue: true,
    stringNumberValue: false,
    tooltipContent: "The unique operator does not accept a value.",
    name: "Unique",
    description: "Run each app task on a unique attribute ID"
  },
  CLUSTER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: "Cluster",
    description: "Run app tasks on nodes that share a certain attribute ID"
  },
  GROUP_BY: {
    requiresValue: false,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    name: "Group By",
    description: "Run app tasks evenly distributed across a certain attribute"
  },
  IS: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: "Is",
    description:
      "Run app tasks on nodes having attribute ID with a specific value"
  },
  LIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: "Like",
    description: "Run app tasks on a particular set of attribute IDs"
  },
  UNLIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: "Unlike",
    description: "Don't run app tasks on a particular set of attribute IDs"
  },
  MAX_PER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    name: "Max Per",
    description: "Run max number of app tasks on each attribute ID"
  }
};

module.exports = OperatorTypes;
