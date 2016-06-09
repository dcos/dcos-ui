import Service from '../structs/Service';

const getFindPropertiesRecursive = function (service, item) {

  return Object.keys(item).reduce(function (memo, subItem) {
    if (item[subItem].type === 'object') {
      memo[subItem] = getFindPropertiesRecursive(service, item[subItem].properties);

      return memo;
    }
    memo[subItem] = item[subItem].getter(service) || item[subItem].default;

    return memo;
  }, {});
};

const ServiceUtil = {
  createServiceFromFormModel: function (formModel) {
    let definition = {};

    if (formModel.General != null) {
      definition.id = formModel.General.id;
      definition.cmd = formModel.General.cmd;
      definition.cpus = formModel.General.cpus;
      definition.mem = formModel.General.mem;
      definition.disk = formModel.General.disk;
      definition.instances = formModel.General.instances;
    }

    if (formModel['Container Settings'] != null) {

      definition.container = {
        docker: {
          image: formModel['Container Settings'].image
        }
      }
    }

    return new Service(definition);
  },

  createFormModelFromSchema: function (schema, service = new Service()) {

    return getFindPropertiesRecursive(service, schema.properties);
  },

  getAppDefinitionFromService: function (service) {
    let appDefinition = {};

    appDefinition.id = service.getId();
    appDefinition.cpus = service.getCpus();
    appDefinition.mem = service.getMem();
    appDefinition.disk = service.getDisk();
    appDefinition.instances = service.getInstancesCount();
    appDefinition.cmd = service.getCommand();

    let containerSettings = service.getContainerSettings();
    if (
      containerSettings && containerSettings.docker &&
      containerSettings.docker.image
    ) {
      appDefinition.container = service.getContainerSettings();
    }

    Object.keys(appDefinition).forEach(function (key) {
      if (appDefinition[key] == null) {
        delete appDefinition[key];
      }
    });

    return appDefinition;
  }
};

module.exports = ServiceUtil;
