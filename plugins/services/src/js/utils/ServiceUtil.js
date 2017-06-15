import { Hooks } from "PluginSDK";
import deepEqual from "deep-equal";

import Application from "../structs/Application";
import ApplicationSpec from "../structs/ApplicationSpec";
import ContainerConstants from "../constants/ContainerConstants";
import Framework from "../structs/Framework";
import FrameworkSpec from "../structs/FrameworkSpec";
import { MESOS_HTTP } from "../constants/HealthCheckProtocols";
import Pod from "../structs/Pod";
import PodSpec from "../structs/PodSpec";
import Service from "../structs/Service";
import ServiceValidatorUtil from "../utils/ServiceValidatorUtil";
import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil";
import VolumeConstants from "../constants/VolumeConstants";

const getFindPropertiesRecursive = function(service, item) {
  return Object.keys(item).reduce(function(memo, subItem) {
    if (item[subItem].type === "group") {
      Object.keys(item[subItem].properties).forEach(function(key) {
        memo[key] = item[subItem].properties[key].default;

        if (
          item[subItem].properties[key].getter &&
          !!item[subItem].properties[key].getter(service)
        ) {
          memo[key] = item[subItem].properties[key].getter(service);
        }
      });

      return memo;
    }

    if (item[subItem].type === "object") {
      memo[subItem] = getFindPropertiesRecursive(
        service,
        item[subItem].properties
      );

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
const pruneHealthCheckAttributes = function(healthCheckSchema, healthCheck) {
  const properties =
    healthCheckSchema.properties.healthChecks.itemShape.properties;

  return Object.keys(properties).reduce(function(memo, prop) {
    if (
      !properties[prop].shouldShow ||
      properties[prop].shouldShow(healthCheck)
    ) {
      if (prop === "command") {
        memo[prop] = { value: healthCheck[prop] };

        return memo;
      }

      if (prop === "portType") {
        return memo;
      }

      memo[prop] = healthCheck[prop];
    }

    return memo;
  }, {});
};

const ServiceUtil = {
  createServiceFromResponse(data) {
    if (ServiceValidatorUtil.isPodResponse(data)) {
      return new Pod(data);
    }

    if (ServiceValidatorUtil.isFrameworkResponse(data)) {
      return new Framework(data);
    }

    if (ServiceValidatorUtil.isApplicationResponse(data)) {
      return new Application(data);
    }

    throw Error("Unknown service response: " + JSON.stringify(data));
  },

  createSpecFromDefinition(data) {
    console.warn("ServieUtil.createSpecFromDefinition has been deprecated.");
    if (ServiceValidatorUtil.isPodSpecDefinition(data)) {
      return new PodSpec(data);
    }

    if (ServiceValidatorUtil.isFrameworkSpecDefinition(data)) {
      return new FrameworkSpec(data);
    }

    if (ServiceValidatorUtil.isApplicationSpecDefinition(data)) {
      return new ApplicationSpec(data);
    }

    throw Error("Unknown service response: " + JSON.stringify(data));
  },

  createSpecFromFormModel(formModel, schema, isEdit = false, definition = {}) {
    console.warn("ServieUtil.createSpecFromFormModel has been deprecated.");
    if (formModel != null) {
      const {
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
        definition.fetch =
          optional.uris &&
          optional.uris.split(",").map(function(uri) {
            return { uri: uri.trim() };
          });
        definition.constraints =
          optional.constraints &&
          optional.constraints.split(",").map(function(item) {
            return item.split(":");
          });
        definition.acceptedResourceRoles =
          optional.acceptedResourceRoles &&
          optional.acceptedResourceRoles.split(",").map(function(item) {
            return item.trim();
          });
        definition.user = optional.user;
      }

      if (containerSettings != null && containerSettings.image != null) {
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
          definition.container.docker.privileged = containerSettings.privileged;
        }
        if (containerSettings.parameters != null) {
          definition.container.docker.parameters = containerSettings.parameters;
        }
      }

      if (volumes != null) {
        let type = ContainerConstants.type.MESOS;
        let volumesList = [];

        if (definition.container == null) {
          definition.container = {};
        }

        if (definition.container.docker && definition.container.docker.image) {
          type = ContainerConstants.type.DOCKER;

          if (volumes.dockerVolumes) {
            volumesList = volumesList.concat(
              volumes.dockerVolumes
                .filter(function({ containerPath, hostPath }) {
                  return containerPath != null && hostPath != null;
                })
                .map(function({ containerPath, hostPath, mode }) {
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
          const externalVolumes = volumes.externalVolumes.map(function({
            containerPath,
            externalName
          }) {
            return {
              containerPath,
              external: {
                name: externalName,
                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            };
          });

          if (externalVolumes.length) {
            volumesList = volumesList.concat(externalVolumes);
          }
          if (!isEdit && volumesList.length) {
            definition.updateStrategy = {
              maximumOverCapacity: 0,
              minimumHealthCapacity: 0
            };
          }
        }

        if (volumes.localVolumes) {
          const localVolumes = volumes.localVolumes.map(function({
            containerPath,
            size
          }) {
            return {
              containerPath,
              persistent: { size },
              mode: VolumeConstants.mode.rw
            };
          });

          if (localVolumes.length) {
            volumesList = volumesList.concat(localVolumes);
            if (!isEdit && volumesList.length) {
              definition.updateStrategy = {
                maximumOverCapacity: 0,
                minimumHealthCapacity: 0
              };
              definition.residency = {
                relaunchEscalationTimeoutSeconds: 10,
                taskLostBehavior: "WAIT_FOREVER"
              };
            }
          }
        }

        if (volumesList.length) {
          definition.container.type = type;
          definition.container.volumes = volumesList;
        }
      }

      if (labels != null && labels.labels != null) {
        definition.labels = labels.labels.reduce(function(memo, item) {
          if (item.key == null) {
            return memo;
          }

          // The 'undefined' value is not rendered by the JSON.stringify,
          // so make sure empty environment variables are not left unrendered
          let value = item.value;
          if (value == null) {
            value = "";
          }

          memo[item.key] = value;

          return memo;
        }, {});
      }

      if (healthChecks != null && healthChecks.healthChecks != null) {
        definition.healthChecks = healthChecks.healthChecks.reduce(function(
          memo,
          healthCheck
        ) {
          // Only set defaults if user has changed a value in the form.
          // I.e. user has intent to create a healthCheck.
          const hasSetValue = Object.values(healthCheck).some(function(value) {
            return value != null && value !== false;
          });

          if (hasSetValue) {
            if (healthCheck.portType == null) {
              healthCheck.portType = "PORT_INDEX";
            }
            if (healthCheck.protocol == null) {
              healthCheck.protocol = MESOS_HTTP;
            }

            memo.push(
              pruneHealthCheckAttributes(
                schema.properties.healthChecks,
                healthCheck
              )
            );
          }

          return memo;
        }, []);
      }

      if (
        environmentVariables != null &&
        environmentVariables.environmentVariables != null
      ) {
        definition.env = environmentVariables.environmentVariables.reduce(
          function(variableMap, variable) {
            if (variable.key == null) {
              return variableMap;
            }

            // The 'undefined' value is not rendered by the JSON.stringify,
            // so make sure empty environment variables are not left unrendered
            let value = variable.value;
            if (value == null) {
              value = "";
            }

            // Pass it through the registered plugins, with key upper cased
            variableMap[variable.key.toUpperCase()] = Hooks.applyFilter(
              "serviceVariableValue",
              value,
              variable,
              definition
            );

            return variableMap;
          },
          {}
        );
      }

      if (networking != null) {
        const isContainerApp =
          containerSettings != null && containerSettings.image != null;

        const networkType = networking.networkType || "host";

        if (networking.ports != null) {
          networking.ports = networking.ports.filter(function(port) {
            return (
              port.name != null || port.lbPort != null || port.loadBalanced
            );
          });
        }

        if (networking.ports != null && networking.ports.length) {
          if (networkType === "host" || !isContainerApp) {
            // Avoid specifying an empty portDefinitions by default
            if (networking.ports.length) {
              definition.portDefinitions = networking.ports.map(function(
                port,
                index
              ) {
                const portMapping = { protocol: "tcp" };
                // Ensure that lbPort is an int
                const lbPort = parseInt(port.lbPort || 0, 10);

                if (networkType === "host") {
                  portMapping.port = 0;
                }
                if (port.loadBalanced === true) {
                  if (networkType === "host") {
                    portMapping.port = lbPort;
                  }
                  if (general != null) {
                    portMapping.labels = {};
                    portMapping.labels[
                      `VIP_${index}`
                    ] = `${general.id}:${lbPort}`;
                  }
                } else if (lbPort != null && /^\d*$/.test(lbPort)) {
                  portMapping.port = lbPort;
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
            definition.container.docker.portMappings = [];
            networking.ports.forEach(function(port, index) {
              const portMapping = { containerPort: 0, protocol: "tcp" };

              if (port.protocol != null) {
                portMapping.protocol = port.protocol;
              }
              if (port.name != null) {
                portMapping.name = port.name;
              }
              const lbPort = parseInt(port.lbPort || 0, 10);
              portMapping.containerPort = lbPort;

              if (ValidatorUtil.isDefined(port.hostPort)) {
                portMapping.hostPort = port.hostPort;
              }

              if (ValidatorUtil.isDefined(port.servicePort)) {
                portMapping.servicePort = port.servicePort;
              } else if (
                port.loadBalanced === true &&
                networkType !== "bridge"
              ) {
                portMapping.servicePort = lbPort;
              }

              if (port.loadBalanced === true) {
                portMapping.labels = {};
                if (general != null) {
                  portMapping.labels[
                    `VIP_${index}`
                  ] = `${general.id}:${lbPort}`;
                }
              }

              if (["host", "bridge"].includes(networkType)) {
                definition.container.docker.portMappings.push(portMapping);
              }

              if (!["host", "bridge"].includes(networkType)) {
                if (port.expose) {
                  portMapping.hostPort = port.hostPort || 0;
                }
                definition.container.docker.portMappings.push(portMapping);
                // TODO - Add portDefinition to loadBalanced field
              }
            });
          }
        }

        if (isContainerApp) {
          if (networkType === "host") {
            definition.container.docker.network = "HOST";
            delete definition.ipAddress;
          } else if (networkType === "bridge") {
            definition.container.docker.network = "BRIDGE";
            delete definition.ipAddress;
          } else {
            definition.container.docker.network = "USER";
            definition.ipAddress = { networkName: networkType };
            delete definition.portDefinitions;
          }
        }
      }
    }

    definition = Object.keys(definition).reduce(function(memo, key) {
      if (!ValidatorUtil.isEmpty(definition[key])) {
        memo[key] = definition[key];
      } else {
        memo[key] = null;
      }

      return memo;
    }, {});

    return ServiceUtil.createSpecFromDefinition(definition);
  },

  createFormModelFromSchema(schema, service = new Application()) {
    console.warn("ServieUtil.createFormModelFromSchema has been deprecated.");

    return getFindPropertiesRecursive(service, schema.properties);
  },

  isEqual(serviceA, serviceB) {
    if (serviceA.constructor !== serviceB.constructor) {
      return false;
    }

    // Only compare the service specs as everything else is status data
    return deepEqual(serviceA.getSpec(), serviceB.getSpec());
  },

  getBaseID(serviceID) {
    // The regular expression `/^(\/.+)$/` is looking for the beginning of the
    // string and matches if the string starts with a `/` and does contain more
    // characters after the slash. This is combined into a group and then
    // replaced with the first group which is the complete string and a `/` is
    // appended. This is needed because in most case a path like
    // `/group/another-group` will be given by `getId` except on root then the
    // return value of `getId` would be `/` so in most cases we want to append a
    // `/` so that the user can begin typing the `id` of their application.
    return serviceID.replace(/^(\/.+)$/, "$1/");
  },

  getDefinitionFromSpec(spec) {
    const definition = spec.toJSON();

    if (spec instanceof ApplicationSpec) {
      Hooks.applyFilter("serviceToAppDefinition", definition, spec);
    }

    return definition;
  },

  getServiceJSON(service) {
    if (!service) {
      return {};
    }

    if (service.toJSON !== undefined) {
      return service.toJSON();
    }

    return service;
  },

  getServiceNameFromTaskID(taskID) {
    const serviceName = taskID.split(".")[0].split("_");

    return serviceName[serviceName.length - 1];
  },

  convertServiceLabelsToArray(service) {
    if (!(service instanceof Service)) {
      return [];
    }

    const labels = service.getLabels();
    if (labels == null) {
      return [];
    }

    return Object.keys(labels).map(key => ({ key, value: labels[key] }));
  }
};

module.exports = ServiceUtil;
