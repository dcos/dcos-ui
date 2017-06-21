const constants = {
  ROUTE_ACCESS_PREFIX: "dcos:adminrouter:service:",
  FRAMEWORK_ID_VALID_CHARACTERS: "\\w-"
};

constants.FRAMEWORK_RESOURCE_ID_REGEXP = new RegExp(
  `^${constants.ROUTE_ACCESS_PREFIX}[${constants.FRAMEWORK_ID_VALID_CHARACTERS}]+$`
);

module.exports = constants;
