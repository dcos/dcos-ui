import Service from '../structs/Service';

const getFindPropertiesRecursive = function (service, item) {

  return Object.keys(item).reduce(function (memo, subItem) {
    if (item[subItem].type === 'object') {
      memo[subItem] = getFindPropertiesRecursive(service, item[subItem].properties);

      return memo;
    }

    memo[subItem] = item[subItem].default

    if (item[subItem].getter) {
      memo[subItem] = item[subItem].getter(service);
    }

    return memo;
  }, {});
};

const ServiceUtil = {
  createServiceFromFormModel: function (formModel) {
    let definition = {};

    if (formModel != null) {
      let {General, Optional} = formModel;
      let ContainerSettings = formModel['Container Settings'];

      if (formModel.General != null) {
        definition.id = General.id;
        definition.cmd = General.cmd;
        definition.cpus = General.cpus;
        definition.mem = General.mem;
        definition.disk = General.disk;
        definition.instances = General.instances;
      }

      if (Optional != null) {
        definition.executor = Optional.executor;
        definition.fetch = Optional.uris &&
          Optional.uris.split(',')
            .map(function (uri) {
              return {uri: uri.trim()};
            });
        definition.constraints = Optional.constraints &&
          Optional.constraints.split(',')
            .map(function (item) {
              return item.split(':')
            });
        definition.acceptedResourceRoles =
          Optional.acceptedResourceRoles &&
            Optional.acceptedResourceRoles.split(',')
              .map(function (item) {
                return item.trim();
              });
        definition.user = Optional.user;
      }

      if (ContainerSettings != null) {
        definition.container = {
          docker: {
            image: ContainerSettings.image
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

    // General
    appDefinition.id = service.getId();
    appDefinition.cpus = service.getCpus();
    appDefinition.mem = service.getMem();
    appDefinition.disk = service.getDisk();
    appDefinition.instances = service.getInstancesCount();
    appDefinition.cmd = service.getCommand();

    // Optional
    appDefinition.executor = service.getExecutor();
    appDefinition.fetch = service.getFetch();
    appDefinition.constraints = service.getConstraints();
    appDefinition.acceptedResourceRoles = service.getAcceptedResourceRoles();
    appDefinition.user = service.getUser();

    let containerSettings = service.getContainerSettings();
    if (containerSettings &&
      containerSettings.docker &&
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
