import {Hooks} from 'PluginSDK';
import Service from '../structs/Service';
import VolumeConstants from '../constants/VolumeConstants';

const getFindPropertiesRecursive = function (service, item) {

  return Object.keys(item).reduce(function (memo, subItem) {

    if (item[subItem].type === 'group') {
      Object.keys(item[subItem].properties).forEach(function (key) {
        memo[key] = item[subItem].properties[key].default;

        if (item[subItem].properties[key].getter &&
          !!item[subItem].properties[key].getter(service)) {
          memo[key] = item[subItem].properties[key].getter(service);
        }
      });

      return memo;
    }

    if (item[subItem].type === 'object') {
      memo[subItem] = getFindPropertiesRecursive(service, item[subItem].properties);

      return memo;
    }

    memo[subItem] = item[subItem].default;

    if (item[subItem].getter) {
      memo[subItem] = item[subItem].getter(service);
    }

    return memo;
  }, {});
};

// Removes redundant attributes
const pruneHealthCheckAttributes = function (healthCheckSchema, healthCheck) {
  let properties = healthCheckSchema
    .properties
    .healthChecks
    .itemShape
    .properties;

  return Object.keys(properties).reduce(function (memo, prop) {
    if (!properties[prop].shouldShow
      || properties[prop].shouldShow(healthCheck)) {

      if (prop === 'command') {
        memo[prop] = {value: healthCheck[prop]};
        return memo;
      }

      memo[prop] = healthCheck[prop];
    }

    return memo;
  }, {});
};

const ServiceUtil = {
  createServiceFromFormModel: function (formModel, schema) {
    let definition = {};

    if (formModel != null) {
      let {
        general,
        optional,
        containerSettings,
        environmentVariables,
        labels,
        volumes,
        networking,
        healthChecks
      } = formModel;

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
        if (containerSettings.forcePullImage != null) {
          definition.container.docker.forcePullImage =
            containerSettings.forcePullImage;
        }
        if (containerSettings.privileged != null) {
          definition.container.docker.privileged =
            containerSettings.privileged;
        }
        if (containerSettings.parameters != null) {
          definition.container.docker.parameters =
            containerSettings.parameters.reduce(function (memo, item) {
              memo[item.key] = item.value;
              return memo;
            }, {});
        }
      }

      if (volumes != null) {
        let type = VolumeConstants.type.MESOS;
        let volumesList = [];

        if (definition.container == null) {
          definition.container = {};
        }

        if (definition.container.docker &&
          definition.container.docker.image) {

          type = VolumeConstants.type.DOCKER;

          if (volumes.dockerVolumes) {
            volumesList = volumesList.concat(
              volumes.dockerVolumes
              .filter(function ({containerPath, hostPath}) {
                return containerPath != null && hostPath != null
              })
              .map(function ({containerPath, hostPath, mode}) {
                return {
                  containerPath,
                  hostPath,
                  mode: VolumeConstants.mode[mode]
                };
              })
            );
          }
        }

        if (volumes.externalVolumes) {
          let externalVolumes = volumes.externalVolumes
            .map(function ({containerPath, externalName}) {
              return {
                containerPath: containerPath,
                external: {
                  name: externalName,
                  provider: 'dvdi',
                  options: {
                    'dvdi/driver': 'rexray'
                  }
                },
                mode: 'RW'
              };
            });

          if (externalVolumes.length > 0) {
            volumesList = volumesList.concat(externalVolumes);
          }
          definition.updateStrategy = {
            maximumOverCapacity: 0,
            minimumHealthCapacity: 0
          };
        }

        if (volumes.localVolumes) {
          let localVolumes = volumes.localVolumes
            .map(function ({containerPath, size}) {
              return {
                containerPath,
                persistent: {size},
                mode: VolumeConstants.mode.rw
              };
            });

          if (localVolumes.length > 0) {
            volumesList = volumesList.concat(localVolumes);
            definition.updateStrategy = {
              maximumOverCapacity: 0,
              minimumHealthCapacity: 0
            };
            definition.residency = {
              relaunchEscalationTimeoutSeconds: 10,
              taskLostBehavior: 'WAIT_FOREVER'
            };
          }
        }

        if (volumesList.length > 0) {
          definition.container.type = type;
          definition.container.volumes = volumesList;
        }
      }

      if (labels != null && labels.labels != null) {
        definition.labels = labels.labels.reduce(function (memo, item) {
          memo[item.key] = item.value;
          return memo;
        }, {});
      }

      if (healthChecks != null && healthChecks.healthChecks != null) {
        definition.healthChecks = healthChecks.healthChecks
          .reduce(function (memo, healthCheck) {
            // Only set defaults if user has changed a value in the form.
            // I.e. user has intent to create a healthCheck.
            let hasSetValue = Object.values(healthCheck).some(function (value) {
              return value != null && value !== false;
            });

            if (hasSetValue) {
              if (healthCheck.portType == null) {
                healthCheck.portType = 'PORT_INDEX';
              }
              if (healthCheck.protocol == null) {
                healthCheck.protocol = 'HTTP';
              }

              memo.push(
                pruneHealthCheckAttributes(
                  schema.properties.healthChecks, healthCheck
                )
              );
            }

            return memo;
          }, []);
      }

      if (environmentVariables != null && environmentVariables.variables != null) {
        definition.env = environmentVariables.variables
          .reduce(function (variableMap, variable) {
            variableMap[variable.key] = Hooks.applyFilter(
              'serviceVariableValue',
              variable.value,
              variable,
              definition
            );

            return variableMap;
          }, {});
      }

      if (networking != null) {
        let isContainerApp = containerSettings != null && containerSettings.image != null;
        let networkType = networking.networkType;
        if (networking.ports != null && networking.ports.length > 0) {
          if (networkType === 'host' || !isContainerApp) {
            // Avoid specifying an empty portDefinitions by default
            if (networking.ports.length > 0) {
              definition.portDefinitions = networking.ports.map(function (port, index) {
                let portMapping = {port: 0, protocol: 'tcp'};
                if (port.discovery === true) {
                  let lbPort = parseInt(port.lbPort || 0, 10);
                  portMapping.port = lbPort;
                  if (general != null) {
                    portMapping.labels = {};
                    portMapping.labels[`VIP_${index}`] = `${general.id}:${lbPort}`;
                  }
                }
                if (port.protocol != null) {
                  portMapping.protocol = port.protocol;
                }
                if (port.name != null) {
                  portMapping.name = port.name;
                }

                return portMapping;
              });
            }
          } else {
            definition.container.docker.portMappings = networking.ports.map(function (port, index) {
              let portMapping = {containerPort: 0, protocol: 'tcp'};

              if (port.protocol != null) {
                portMapping.protocol = port.protocol;
              }
              if (port.name != null) {
                portMapping.name = port.name;
              }
              let lbPort = parseInt(port.lbPort || 0, 10);
              portMapping.containerPort = lbPort;
              if (port.discovery === true) {
                if (networkType === 'bridge') {
                  portMapping.hostPort = lbPort;
                } else {
                  portMapping.servicePort = lbPort;
                }
                portMapping.labels = {};
                if (general != null) {
                  portMapping.labels[`VIP_${index}`] = `${general.id}:${lbPort}`;
                }
              }

              return portMapping;
            });
          }
        }

        if (isContainerApp) {
          if (networkType === 'host') {
            definition.container.docker.network = 'HOST';
          } else if (networkType === 'bridge') {
            definition.container.docker.network = 'BRIDGE';
          } else {
            definition.container.docker.network = 'USER';
            definition.ipAddress = {networkName: 'd-overlay-1'};
          }
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
    appDefinition.labels = service.getLabels();
    appDefinition.healthChecks = service.getHealthChecks();

    let containerSettings = service.getContainerSettings();
    if (containerSettings &&
      (containerSettings.docker &&
      containerSettings.docker.image ||
      containerSettings.type === VolumeConstants.type.MESOS)
    ) {
      appDefinition.container = containerSettings;

      if (appDefinition.container.type === VolumeConstants.type.MESOS) {
        delete(appDefinition.container.docker);
      }
    }

    appDefinition.updateStrategy = service.getUpdateStrategy();
    appDefinition.residency = service.getResidency();
    appDefinition.ipAddress = service.getIpAddress();

    // Environment Variables
    appDefinition.env = service.getEnvironmentVariables();

    appDefinition.portDefinitions = service.getPortDefinitions();

    Hooks.applyFilter(
      'serviceToAppDefinition',
      appDefinition,
      service
    );

    Object.keys(appDefinition).forEach(function (key) {
      if (appDefinition[key] == null) {
        delete appDefinition[key];
      }
    });

    return appDefinition;
  },

  convertServiceLabelsToArray: function (service) {
    if (!(service instanceof Service)) {
      return [];
    }

    let labels = service.getLabels();
    if (labels == null) {
      return [];
    }

    return Object.keys(labels).map(key => ({key, value: labels[key]}));
  }
};

module.exports = ServiceUtil;
