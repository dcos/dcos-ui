import React from "react";
import { Table } from "reactjs-components";

import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import Networking from "#SRC/js/constants/Networking";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigUtil from "../utils/ServiceConfigUtil";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";

class ServiceNetworkingConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem(row) {
    if (row.key !== "networks.0.name") {
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
          key: "networks.0.mode",
          label: "Network Mode"
        },
        {
          key: "networks.0.name",
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

            const networkType = findNestedPropertyInObject(
              appDefinition,
              "networks.0.mode"
            );

            const containerPortMappings = findNestedPropertyInObject(
              appDefinition,
              "container.portMappings"
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
