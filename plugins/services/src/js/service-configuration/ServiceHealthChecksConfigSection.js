import React from "react";
import { Table } from "reactjs-components";

import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from "../utils/ServiceConfigDisplayUtil";
import ConfigurationMapDurationValue
  from "../components/ConfigurationMapDurationValue";
import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapValue
  from "../../../../../src/js/components/ConfigurationMapValue";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";
import {
  COMMAND,
  MESOS_HTTP,
  MESOS_HTTPS
} from "../constants/HealthCheckProtocols";
import Util from "../../../../../src/js/utils/Util";

function renderDuration(prop, row) {
  const value = row[prop] || null;

  return (
    <ConfigurationMapDurationValue
      defaultValue={<em>Not Configured</em>}
      units="sec"
      value={value}
    />
  );
}

class ServiceHealthChecksConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem() {
    const { appConfig } = this.props;

    return !Util.findNestedPropertyInObject(appConfig, "healthChecks.length");
  }

  /**
   * @override
   */
  getDefinition() {
    const { onEditClick } = this.props;

    return {
      tabViewID: "healthChecks",
      values: [
        {
          key: "healthChecks",
          render(healthChecks) {
            if (healthChecks.length === 0) {
              return null;
            }

            return (
              <ConfigurationMapHeading
                key="service-health-checks-heading"
                level={1}
              >

                Health Checks
              </ConfigurationMapHeading>
            );
          }
        },
        {
          key: "healthChecks",
          render(healthChecks) {
            const serviceEndpointHealthChecks = healthChecks.filter(
              healthCheck => {
                return [MESOS_HTTP, MESOS_HTTPS].includes(healthCheck.protocol);
              }
            );

            const columns = [
              {
                heading: getColumnHeadingFn("Protocol"),
                prop: "protocol",
                render(prop, row) {
                  return (
                    <ConfigurationMapValue>
                      {getDisplayValue(row[prop])}
                    </ConfigurationMapValue>
                  );
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Path"),
                prop: "path",
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return (
                    <ConfigurationMapValue>
                      {getDisplayValue(row[prop])}
                    </ConfigurationMapValue>
                  );
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Grace Period"),
                prop: "gracePeriodSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Interval"),
                prop: "intervalSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Timeout"),
                prop: "timeoutSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                className: getColumnClassNameFn(),
                heading: getColumnHeadingFn("Max Failures"),
                prop: "maxConsecutiveFailures",
                render(prop, row) {
                  return (
                    <ConfigurationMapValue>
                      {getDisplayValue(row[prop])}
                    </ConfigurationMapValue>
                  );
                },
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
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="healthChecks"
                    />
                  );
                }
              });
            }

            if (serviceEndpointHealthChecks.length === 0) {
              return null;
            }

            return [
              <ConfigurationMapHeading
                key="service-endpoint-health-checks-heading"
                level={2}
              >

                Service Endpoint Health Checks
              </ConfigurationMapHeading>,
              <Table
                key="service-endpoint-health-checks"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={serviceEndpointHealthChecks}
              />
            ];
          }
        },
        {
          key: "healthChecks",
          render(healthChecks) {
            const commandHealthChecks = healthChecks.filter(healthCheck => {
              return healthCheck.protocol === COMMAND;
            });

            const columns = [
              {
                heading: getColumnHeadingFn("Command"),
                prop: "command",
                render: (prop, row) => {
                  const command = row[prop] || {};
                  const value = getDisplayValue(command.value);
                  if (!command.value) {
                    return value;
                  }

                  return (
                    <ConfigurationMapValue>
                      <pre className="flush transparent wrap">
                        {value}
                      </pre>
                    </ConfigurationMapValue>
                  );
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Grace Period"),
                prop: "gracePeriodSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Interval"),
                prop: "intervalSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Timeout"),
                prop: "timeoutSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                className: getColumnClassNameFn(),
                heading: getColumnHeadingFn("Max Failures"),
                prop: "maxConsecutiveFailures",
                render(prop, row) {
                  return (
                    <ConfigurationMapValue>
                      {getDisplayValue(row[prop])}
                    </ConfigurationMapValue>
                  );
                },
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
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="environment"
                    />
                  );
                }
              });
            }

            if (commandHealthChecks.length === 0) {
              return null;
            }

            return [
              <ConfigurationMapHeading
                key="command-health-checks-heading"
                level={2}
              >

                Command Health Checks
              </ConfigurationMapHeading>,
              <Table
                key="command-health-checks"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={commandHealthChecks}
              />
            ];
          }
        }
      ]
    };
  }
}

module.exports = ServiceHealthChecksConfigSection;
