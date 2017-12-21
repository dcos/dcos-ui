const DEFAULT_HELP = "A string, integer or regex value.";
const OPTIONAL_HELP = `${DEFAULT_HELP} This field is optional.`;

const OperatorTypes = {
  UNIQUE: {
    requiresValue: false,
    requiresEmptyValue: true,
    stringNumberValue: false,
    tooltipContent: "The unique operator does not accept a value.",
    helpContent: DEFAULT_HELP
  },
  CLUSTER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP
  },
  GROUP_BY: {
    requiresValue: false,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    helpContent: OPTIONAL_HELP
  },
  IS: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP
  },
  LIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP
  },
  UNLIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    helpContent: DEFAULT_HELP
  },
  MAX_PER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    helpContent: DEFAULT_HELP
  }
};

module.exports = OperatorTypes;
