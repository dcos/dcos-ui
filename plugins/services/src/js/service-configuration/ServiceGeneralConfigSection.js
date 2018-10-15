import { Trans } from "@lingui/macro";
import React from "react";
import { Table } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { formatResource } from "#SRC/js/utils/Units";

import ContainerConstants from "../constants/ContainerConstants";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from "../utils/ServiceConfigDisplayUtil";

const {
  type: { DOCKER, MESOS },
  labelMap
} = ContainerConstants;

class ServiceGeneralConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem(row) {
    const { appConfig } = this.props;

    switch (row.key) {
      case "fetch":
        return !findNestedPropertyInObject(appConfig, "fetch.length");
      case "gpus":
        return !findNestedPropertyInObject(appConfig, "gpus");
      case "backoffSeconds":
        return !findNestedPropertyInObject(appConfig, "backoffSeconds");
      case "backoffFactor":
        return !findNestedPropertyInObject(appConfig, "backoffFactor");
      case "maxLaunchDelaySeconds":
        return !findNestedPropertyInObject(appConfig, "maxLaunchDelaySeconds");
      case "minHealthOpacity":
        return !findNestedPropertyInObject(appConfig, "minHealthOpacity");
      case "maxOverCapacity":
        return !findNestedPropertyInObject(appConfig, "maxOverCapacity");
      case "acceptedResourceRoles":
        return !findNestedPropertyInObject(
          appConfig,
          "acceptedResourceRoles.length"
        );
      case "dependencies":
        return !findNestedPropertyInObject(appConfig, "dependencies.length");
      case "executor":
        return !findNestedPropertyInObject(appConfig, "executor");
      case "user":
        return !findNestedPropertyInObject(appConfig, "user");
      case "args":
        return !findNestedPropertyInObject(appConfig, "args.length");
      case "version":
        return !findNestedPropertyInObject(appConfig, "version");
      default:
        return false;
    }
  }

  /**
   * @override
   */
  getMountType() {
    return "CreateService:ServiceConfigDisplay:App:General";
  }
  /**
   * @override
   */
  getDefinition() {
    const { onEditClick } = this.props;

    return {
      tabViewID: "services",
      values: [
        {
          heading: "Service",
          headingLevel: 1
        },
        {
          key: "id",
          label: "Service ID"
        },
        {
          key: "instances",
          label: "Instances"
        },
        {
          key: "container.type",
          label: "Container Runtime",
          transformValue(runtime) {
            const transId = labelMap[runtime] || labelMap[MESOS];

            return <Trans render="span" id={transId} />;
          }
        },
        {
          key: "cpus",
          label: "CPU"
        },
        {
          key: "mem",
          label: "Memory",
          transformValue(value) {
            if (value == null) {
              return value;
            }

            return formatResource("mem", value);
          }
        },
        {
          key: "disk",
          label: "Disk",
          transformValue(value) {
            if (value == null) {
              return value;
            }

            return formatResource("disk", value);
          }
        },
        {
          key: "gpus",
          label: "GPU"
        },
        {
          key: "backoffSeconds",
          label: "Backoff Seconds"
        },
        {
          key: "backoffFactor",
          label: "Backoff Factor"
        },
        {
          key: "maxLaunchDelaySeconds",
          label: "Backoff Max Launch Delay"
        },
        {
          key: "minHealthOpacity",
          label: "Upgrade Min Health Capacity"
        },
        {
          key: "maxOverCapacity",
          label: "Upgrade Max Overcapacity"
        },
        {
          key: "container.docker.image",
          label: "Container Image",
          transformValue(value, appConfig) {
            const runtime = findNestedPropertyInObject(
              appConfig,
              "container.type"
            );

            // Disabled for MESOS
            return getDisplayValue(value, runtime == null || runtime === MESOS);
          }
        },
        {
          key: "container.docker.privileged",
          label: "Extended Runtime Priv.",
          transformValue(value, appConfig) {
            const runtime = findNestedPropertyInObject(
              appConfig,
              "container.type"
            );
            // Disabled for DOCKER
            if (runtime !== DOCKER && value == null) {
              return getDisplayValue(null, true);
            }

            // Cast boolean as a string.
            return String(Boolean(value));
          }
        },
        {
          key: "container.docker.forcePullImage",
          label: "Force Pull on Launch",
          transformValue(value, appConfig) {
            const runtime = findNestedPropertyInObject(
              appConfig,
              "container.type"
            );
            // Disabled for DOCKER
            if (runtime !== DOCKER && value == null) {
              return getDisplayValue(null, true);
            }

            // Cast boolean as a string.
            return String(Boolean(value));
          }
        },
        {
          key: "cmd",
          label: "Command",
          type: "pre"
        },
        {
          key: "acceptedResourceRoles",
          label: "Resource Roles",
          transformValue(value = []) {
            return value.join(", ");
          }
        },
        {
          key: "dependencies",
          label: "Dependencies",
          transformValue(value = []) {
            return value.join(", ");
          }
        },
        {
          key: "executor",
          label: "Executor"
        },
        {
          key: "user",
          label: "User"
        },
        {
          key: "args",
          label: "Args",
          transformValue(value = []) {
            if (!value.length) {
              return getDisplayValue(null);
            }

            const args = value.map((arg, index) => (
              <pre key={index} className="flush transparent wrap">
                {arg}
              </pre>
            ));

            return <div>{args}</div>;
          }
        },
        {
          key: "version",
          label: "Version"
        },
        {
          key: "fetch",
          heading: "Container Artifacts",
          headingLevel: 2
        },
        {
          key: "fetch",
          render(data) {
            const columns = [
              {
                heading: getColumnHeadingFn("Artifact Uri"),
                prop: "uri",
                render: (prop, row) => {
                  const value = row[prop];

                  return getDisplayValue(value);
                },
                className: getColumnClassNameFn(
                  "configuration-map-table-label"
                ),
                sortable: true
              }
            ];

            if (onEditClick) {
              columns.push({
                heading() {
                  return null;
                },
                className: "configuration-map-action",
                prop: "edit",
                render() {
                  return (
                    <a
                      className="button button-link flush table-display-on-row-hover"
                      onClick={onEditClick.bind(null, "services")}
                    >
                      Edit
                    </a>
                  );
                }
              });
            }

            return (
              <Table
                key="artifacts-table"
                className="table table-flush table-borderless-outer table-borderless-inner-columns vertical-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={data}
              />
            );
          }
        }
      ]
    };
  }
}

module.exports = ServiceGeneralConfigSection;
