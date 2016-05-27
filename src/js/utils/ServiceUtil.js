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

    if (formModel != null) {
      if (formModel.General != null) {
        definition.id = formModel.General.id;
        definition.cmd = formModel.General.cmd;
        definition.cpus = formModel.General.cpus;
        definition.mem = formModel.General.mem;
        definition.disk = formModel.General.disk;
        definition.instances = formModel.General.instances;
      }

      if (formModel.Optional != null) {
        definition.executor = formModel.Optional.executor;
        definition.fetch = formModel.Optional.uris &&
          formModel.Optional.uris.split(',')
            .map(function (uri) {
              return {uri: uri.trim()};
            });
        definition.constraints = formModel.Optional.constraints &&
          formModel.Optional.constraints.split(',')
            .map(function (item) {
              return item.split(':')
            });
        definition.acceptedResourceRoles =
          formModel.Optional.acceptedResourceRoles &&
            formModel.Optional.acceptedResourceRoles.split(',')
              .map(function (item) {
                return item.trim();
              });
      }

      if (formModel['Container Settings'] != null) {
        definition.container = {
          docker: {
            image: formModel['Container Settings'].image
          }
        };
        if (formModel['Container Settings'].network != null) {
          definition.container.docker.network =
            formModel['Container Settings'].network.toUpperCase();
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

    appDefinition.executor = service.getExecutor();
    appDefinition.fetch = service.getFetch();
    appDefinition.constraints = service.getConstraints();
    appDefinition.acceptedResourceRoles = service.getAcceptedResourceRoles();

    let containerSettings = service.getContainerSettings();
    if (
      containerSettings && containerSettings.docker &&
      containerSettings.docker.image
    ) {
      appDefinition.container = containerSettings;
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
