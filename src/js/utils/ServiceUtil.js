import Service from '../structs/Service';

const getFindPropertiesRecursive = function (service) {
  let findPropertiesRecursive = function (item) {
    return Object.keys(item).reduce(function (memo, subItem) {
      if (item[subItem].type === 'object') {
        memo[subItem] = findPropertiesRecursive(item[subItem].properties);
        return memo;
      }

      memo[subItem] = service.get(subItem) || item[subItem].default;
      return memo;
    }, {});
  };
  return findPropertiesRecursive;
};

const ServiceUtil = {
  convertFormModelToService: function (formModel) {
    formModel = Object.keys(formModel).reduce(function (memory, section) {
      Object.keys(formModel[section]).forEach(function (attribute) {
        memory[attribute] = formModel[section][attribute];
      });
      return memory;
    }, {});
    return new Service(formModel);
  },

  createFormModelFromSchema: function (service, schema) {
    return getFindPropertiesRecursive(service)(schema.properties);
  },

  getAppDefinitionFromService: function (service) {
    let appDefinition = {};

    appDefinition.id = service.getId();
    appDefinition.cpus = service.getCpus();
    appDefinition.mem = service.getMem();
    appDefinition.disk = service.getDisk();
    appDefinition.instances = service.getInstancesCount();
    appDefinition.cmd = service.getCommand();

    Object.keys(appDefinition).forEach(function (key) {
      if (appDefinition[key] == null) {
        delete appDefinition[key];
      }
    });

    return appDefinition;
  }
};

module.exports = ServiceUtil;
