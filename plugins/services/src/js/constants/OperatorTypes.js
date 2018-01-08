const DEFAULT_HELP = "A string, integer or regex value.";
const OPTIONAL_HELP = `${DEFAULT_HELP} This field is optional.`;

const OperatorTypes = {
  UNIQUE: {
    requiresValue: false,
    requiresEmptyValue: true,
    stringNumberValue: false,
    tooltipContent: "The unique operator does not accept a value.",
    helpContent: DEFAULT_HELP,
    name: "Unique",
    description: "Run each app task on a unique attribute ID"
  },
  CLUSTER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP,
    name: "Cluster",
    description: "Run app tasks on nodes that share a certain attribute ID"
  },
  GROUP_BY: {
    requiresValue: false,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    helpContent: OPTIONAL_HELP,
    name: "Group By",
    description: "Run app tasks evenly distributed across a certain attribute"
  },
  IS: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP,
    name: "Is",
    description: "Run app tasks on nodes having attribute ID with a specific value"
  },
  LIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP,
    name: "Like",
    description: "Run app tasks on a particular set of attribute IDs"
  },
  UNLIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP,
    name: "Unlike",
    description: "Don't run app tasks on a particular set of attribute IDs"
  },
  MAX_PER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    helpContent: DEFAULT_HELP,
    name: "Max Per",
    description: "Run max number of app tasks on each attribute ID"
  }
};

module.exports = OperatorTypes;
