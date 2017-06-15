import React from "react";
import { Table } from "reactjs-components";

import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import Networking from "../../../../../src/js/constants/Networking";
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigUtil from "../utils/ServiceConfigUtil";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";
import { findNestedPropertyInObject } from "../../../../../src/js/utils/Util";
import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil";

function getNetworkType(networkType, appDefinition) {
  networkType = networkType || Networking.type.HOST;
  const networkName = findNestedPropertyInObject(
    appDefinition,
    "ipAddress.networkName"
  );

  return networkName != null ? Networking.type.USER : networkType;
}

class ServiceNetworkingConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem(row) {
    if (row.key !== "ipAddress.networkName") {
      return false;
    }

    const { appConfig } = this.props;
    const networkName = findNestedPropertyInObject(appConfig, row.key);

    return !networkName;
  }

  /**
   * @override
   */
  getDefinition() {
    const { onEditClick } = this.props;

    return {
      tabViewID: "networking",
      values: [
        {
          heading: "Network",
          headingLevel: 1
        },
        {
          key: "container.docker.network",
          label: "Network Type",
          transformValue: getNetworkType
        },
        {
          key: "ipAddress.networkName",
          label: "Network Name"
        },
        {
          key: "portDefinitions",
          render(portDefinitions, appDefinition) {
            const keys = {
              name: "name",
              port: "port",
              protocol: "protocol",
              labels: "labels"
            };

            const networkType = getNetworkType(
              findNestedPropertyInObject(
                appDefinition,
                "container.docker.network"
              ),
              appDefinition
            );

            const containerPortMappings = findNestedPropertyInObject(
              appDefinition,
              "container.docker.portMappings"
            );
            if (
              containerPortMappings != null &&
              containerPortMappings.length !== 0
            ) {
              portDefinitions = containerPortMappings;
              keys.port = "hostPort";
            }

            // Make sure to have something to render, even if there is no data
            if (!portDefinitions) {
              portDefinitions = [];
            }

            const columns = [
              {
                heading: getColumnHeadingFn("Name"),
                prop: keys.name,
                render(prop, row) {
                  return getDisplayValue(row[prop]);
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Protocol"),
                prop: keys.protocol,
                className: getColumnClassNameFn(),
                render(prop, row) {
                  let protocol = row[prop] || "";
                  protocol = protocol.replace(/,\s*/g, ", ");

                  return getDisplayValue(protocol);
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Host Port"),
                prop: keys.port,
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return getDisplayValue(row[prop]);
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Load Balanced Address"),
                prop: "",
                className: getColumnClassNameFn(),
                render(prop, row) {
                  const { port, labels } = row;
                  const vipLabel = ServiceConfigUtil.findVIPLabel(labels);

                  if (vipLabel) {
                    return ServiceConfigUtil.buildHostNameFromVipLabel(
                      labels[vipLabel],
                      port
                    );
                  }

                  return <em>Not Enabled</em>;
                },
                sortable: true
              }
            ];

            // We add the container port column if the network type is anything
            // but HOST.
            if (networkType !== Networking.type.HOST) {
              const hostPortIndex = columns.findIndex(column => {
                return column.prop === keys.port;
              });

              columns.splice(hostPortIndex, 0, {
                heading: getColumnHeadingFn("Container Port"),
                prop: "containerPort",
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return getDisplayValue(row[prop]);
                },
                sortable: true
              });
            }

            if (onEditClick) {
              columns.push({
                heading() {
                  return null;
                },
                className: "configuration-map-action",
                prop: "edit",
                render() {
                  return (
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="networking"
                    />
                  );
                }
              });
            }

            if (ValidatorUtil.isEmpty(portDefinitions)) {
              return;
            }

            return [
              <ConfigurationMapHeading
                key="service-endpoints-heading"
                level={2}
              >

                Service Endpoints
              </ConfigurationMapHeading>,
              <Table
                key="service-endpoints"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={portDefinitions}
              />
            ];
          }
        }
      ]
    };
  }
}

module.exports = ServiceNetworkingConfigSection;
