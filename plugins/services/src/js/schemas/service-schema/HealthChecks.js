import FormUtil from "../../../../../../src/js/utils/FormUtil";
import {
  COMMAND,
  MESOS_HTTP,
  MESOS_HTTPS
} from "../../constants/HealthCheckProtocols";
import NetworkValidatorUtil
  from "../../../../../../src/js/utils/NetworkValidatorUtil";
import ValidatorUtil from "../../../../../../src/js/utils/ValidatorUtil";

const HealthChecks = {
  type: "object",
  title: "Health Checks",
  description: "Perform health checks on running tasks to determine if they are operating as expected.",
  properties: {
    healthChecks: {
      type: "array",
      duplicable: true,
      addLabel: "Add Another Health Check",
      getter(service) {
        let healthChecks = service.getHealthChecks();

        if (healthChecks == null) {
          return [];
        }

        healthChecks = healthChecks.map(function(check) {
          if (check.protocol === COMMAND) {
            check.command = check.command.value;
          }
          check.portType = "PORT_INDEX";
          if (check.port != null) {
            check.portType = "PORT_NUMBER";
          }

          return check;
        });

        return healthChecks;
      },
      deleteButtonTop: true,
      getTitle(index = 1) {
        return `Health check #${index}`;
      },
      filterProperties(service = {}, instanceDefinition) {
        const properties =
          HealthChecks.properties.healthChecks.itemShape.properties;

        instanceDefinition.forEach(function(definition) {
          let prop = definition.name;
          if (FormUtil.isFieldInstanceOfProp("healthChecks", definition)) {
            prop = FormUtil.getPropKey(definition.name);
          }
          if (properties[prop].shouldShow) {
            definition.formElementClass = {
              "hidden-form-element": !properties[prop].shouldShow(service)
            };
          }
        });
      },
      itemShape: {
        properties: {
          protocol: {
            title: "Protocol",
            fieldType: "select",
            type: "string",
            options: [MESOS_HTTP, MESOS_HTTPS, COMMAND]
          },
          command: {
            title: "Command",
            type: "string",
            shouldShow(service) {
              return service.protocol === "COMMAND";
            },
            externalValidator({ healthChecks }, definition) {
              const index = FormUtil.getPropIndex(definition.name);
              const { [definition.name]: command } = healthChecks;
              const {
                [`healthChecks[${index}].protocol`]: protocol
              } = healthChecks;

              if (protocol === "COMMAND" && !ValidatorUtil.isDefined(command)) {
                definition.showError = "Command must not be empty.";

                return false;
              }

              return true;
            }
          },
          path: {
            title: "Path",
            type: "string",
            shouldShow(service) {
              return (
                service.protocol == null || service.protocol === MESOS_HTTP
              );
            },
            externalValidator({ healthChecks }, definition) {
              const index = FormUtil.getPropIndex(definition.name);
              const { [definition.name]: path } = healthChecks;
              const {
                [`healthChecks[${index}].protocol`]: protocol
              } = healthChecks;

              if (protocol === MESOS_HTTP && !ValidatorUtil.isDefined(path)) {
                definition.showError = "Path must not be empty.";

                return false;
              }

              return true;
            }
          },
          gracePeriodSeconds: {
            description: "Grace period in seconds",
            title: "Grace Period",
            type: "number",
            externalValidator({ healthChecks }, definition) {
              const { [definition.name]: gracePeriodSeconds } = healthChecks;

              if (
                ValidatorUtil.isDefined(gracePeriodSeconds) &&
                !ValidatorUtil.isNumber(gracePeriodSeconds)
              ) {
                definition.showError = "Grace Period must be a number.";

                return false;
              }

              return true;
            }
          },
          intervalSeconds: {
            description: "Interval in seconds",
            title: "Interval",
            type: "number",
            externalValidator({ healthChecks }, definition) {
              const { [definition.name]: intervalSeconds } = healthChecks;

              if (
                ValidatorUtil.isDefined(intervalSeconds) &&
                !ValidatorUtil.isNumber(intervalSeconds)
              ) {
                definition.showError = "Interval must be a number.";

                return false;
              }

              return true;
            }
          },
          timeoutSeconds: {
            description: "Timeout in seconds",
            title: "Timeout",
            type: "number",
            externalValidator({ healthChecks }, definition) {
              const { [definition.name]: timeoutSeconds } = healthChecks;

              if (
                ValidatorUtil.isDefined(timeoutSeconds) &&
                !ValidatorUtil.isNumber(timeoutSeconds)
              ) {
                definition.showError = "Timeout must be a number.";

                return false;
              }

              return true;
            }
          },
          maxConsecutiveFailures: {
            title: "Maximum Consecutive Failures",
            type: "number",
            externalValidator({ healthChecks }, definition) {
              const {
                [definition.name]: maxConsecutiveFailures
              } = healthChecks;

              if (
                ValidatorUtil.isDefined(maxConsecutiveFailures) &&
                !ValidatorUtil.isNumber(maxConsecutiveFailures)
              ) {
                definition.showError =
                  "Maximum Consecutive Failures must be a number.";

                return false;
              }

              return true;
            }
          },
          port: {
            title: "Port Number",
            type: "number",
            shouldShow(service) {
              return service.portType === "PORT_NUMBER";
            },
            externalValidator({ healthChecks }, definition) {
              const index = FormUtil.getPropIndex(definition.name);
              const { [definition.name]: port } = healthChecks;
              const {
                [`healthChecks[${index}].portType`]: type
              } = healthChecks;

              if (
                type === "PORT_NUMBER" &&
                ValidatorUtil.isDefined(port) &&
                !NetworkValidatorUtil.isValidPort(port)
              ) {
                definition.showError =
                  "Port Number must be a number between 0 and 65535.";

                return false;
              }

              return true;
            }
          },
          portIndex: {
            title: "Port Index",
            type: "number",
            shouldShow(service) {
              return (
                service.portType == null || service.portType === "PORT_INDEX"
              );
            },
            externalValidator({ healthChecks, networking }, definition) {
              const index = FormUtil.getPropIndex(definition.name);
              const { [definition.name]: portIndex } = healthChecks;
              const {
                [`healthChecks[${index}].portType`]: type
              } = healthChecks;
              const { ports = [] } = FormUtil.modelToCombinedProps(networking);
              const largestValidIndex = Math.max(ports.length - 1, 0);

              if (
                type !== "PORT_NUMBER" &&
                ValidatorUtil.isDefined(portIndex) &&
                !ValidatorUtil.isNumberInRange(portIndex, {
                  max: largestValidIndex
                })
              ) {
                definition.showError =
                  "Port Index must be a number " +
                  `between 0 and ${largestValidIndex}.`;

                return false;
              }

              return true;
            }
          },
          portType: {
            title: "Port Type",
            fieldType: "select",
            type: "string",
            options: [
              {
                html: "Port Index",
                id: "PORT_INDEX"
              },
              {
                html: "Port Number",
                id: "PORT_NUMBER"
              }
            ]
          },
          ignoreHttp1xx: {
            label: "Ignore HTTP Status Codes 100 to 199",
            showLabel: false,
            type: "boolean",
            shouldShow(service) {
              return (
                service.protocol == null || service.protocol === MESOS_HTTP
              );
            }
          }
        }
      }
    }
  }
};

module.exports = HealthChecks;
