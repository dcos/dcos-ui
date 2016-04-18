let constants = {
  ROUTE_ACCESS_PREFIX: 'dcos:adminrouter:service:',
  SERVICE_ID_VALID_CHARACTERS: '\\w-'
};

constants.SERVICE_RESOURCE_ID_REGEXP = new RegExp(
  `^${constants.ROUTE_ACCESS_PREFIX}[${constants.SERVICE_ID_VALID_CHARACTERS}]+$`
);

module.exports = constants;
