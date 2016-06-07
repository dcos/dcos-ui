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
      let {general, optional, containerSettings} = formModel;

      if (general != null) {
        definition.id = general.id;
        definition.cmd = general.cmd;
        definition.cpus = general.cpus;
        definition.mem = general.mem;
        definition.disk = general.disk;
        definition.instances = general.instances;
      }

      if (optional != null) {
        definition.executor = optional.executor;
        definition.fetch = optional.uris &&
          optional.uris.split(',')
            .map(function (uri) {
              return {uri: uri.trim()};
            });
        definition.constraints = optional.constraints &&
          optional.constraints.split(',')
            .map(function (item) {
              return item.split(':')
            });
        definition.acceptedResourceRoles =
          optional.acceptedResourceRoles &&
            optional.acceptedResourceRoles.split(',')
              .map(function (item) {
                return item.trim();
              });
        definition.user = optional.user;
      }

      if (containerSettings != null) {
        definition.container = {
          docker: {
            image: containerSettings.image
          }
        };
        if (containerSettings.network != null) {
          definition.container.docker.network =
            containerSettings.network.toUpperCase();
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
