/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import MesosConstants from "../../constants/MesosConstants";
import ResourceValidatorUtil from "../../utils/ResourceValidatorUtil";
import ServiceValidatorUtil from "../../utils/ServiceValidatorUtil";

const General = {
  title: "General",
  description: (
    <span>
      Configure your container service here or
      {" "}
      <a href="#/universe">install from Universe</a>
      .
    </span>
  ),
  type: "object",
  properties: {
    id: {
      title: "ID",
      focused: true,
      description: "ID for the service",
      type: "string",
      getter(service) {
        return service.getId();
      },
      externalValidator({ general }, definition) {
        if (!ServiceValidatorUtil.isValidServiceID(general.id)) {
          definition.showError =
            "ID must not be empty, must not contain " +
            "whitespace, and should not contain any other characters than " +
            'lowercase letters, digits, hyphens, ".", and ".."';

          return false;
        }

        return true;
      }
    },
    resources: {
      type: "group",
      properties: {
        cpus: {
          title: "CPUs",
          description: "Amount of CPUs used for the service",
          type: "number",
          default: 1,
          getter(service) {
            return `${service.getCpus() || this.default}`;
          },
          externalValidator({ general }, definition) {
            if (!ResourceValidatorUtil.isValidCPUs(general.cpus)) {
              definition.showError =
                "CPUs must be a number greater than " +
                `or equal to ${MesosConstants.MIN_CPUS}`;

              return false;
            }

            return true;
          }
        },
        mem: {
          title: "Memory (MiB)",
          type: "number",
          default: 128,
          getter(service) {
            return `${service.getMem() || this.default}`;
          },
          externalValidator({ general }, definition) {
            if (!ResourceValidatorUtil.isValidMemory(general.mem)) {
              definition.showError =
                "Memory must be a number greater than " +
                `or equal to ${MesosConstants.MIN_MEM}`;

              return false;
            }

            return true;
          }
        },
        disk: {
          title: "Disk (MiB)",
          type: "number",
          default: 0,
          getter(service) {
            return `${service.getDisk() || this.default}`;
          },
          externalValidator({ general }, definition) {
            if (!ResourceValidatorUtil.isValidDisk(general.disk)) {
              definition.showError = "Disk must be a non-negative number";

              return false;
            }

            return true;
          }
        },
        instances: {
          title: "Instances",
          type: "number",
          default: 1,
          getter(service) {
            const taskRunning = service.get("TASK_RUNNING") || 0;
            let instances = service.getInstancesCount();
            instances -= taskRunning;
            if ((instances !== 0 && !instances) || instances < 0) {
              instances = this.default;
            }

            return `${instances}`;
          }
        }
      }
    },
    cmd: {
      title: "Command",
      description: "Command executed by the service",
      type: "string",
      multiLine: true,
      getter(service) {
        return service.getCommand();
      }
    }
  },
  required: ["id"]
};

module.exports = General;
