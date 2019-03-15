import React from "react";
import { Table } from "reactjs-components";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Util from "#SRC/js/utils/Util";
import EmptyStates from "#SRC/js/constants/EmptyStates";

import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from "../utils/ServiceConfigDisplayUtil";
import ConfigurationMapDurationValue from "../components/ConfigurationMapDurationValue";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";
import {
  COMMAND,
  MESOS_HTTP,
  MESOS_HTTPS
} from "../constants/HealthCheckProtocols";

function renderDuration(prop, row) {
  const value = row[prop] || null;

  return (
    <ConfigurationMapDurationValue
      defaultValue={<em>{EmptyStates.CONFIG_VALUE}</em>}
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
  getMountType() {
    return "CreateService:ServiceConfigDisplay:App:HealthChecks";
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
              <Trans
                render={
                  <ConfigurationMapHeading
                    key="service-health-checks-heading"
                    level={1}
                  />
                }
              >
                Health Checks
              </Trans>
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
                heading: getColumnHeadingFn(i18nMark("Protocol")),
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
                heading: getColumnHeadingFn(i18nMark("Path")),
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
                heading: getColumnHeadingFn(i18nMark("Grace Period")),
                prop: "gracePeriodSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn(i18nMark("Interval")),
                prop: "intervalSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn(i18nMark("Timeout")),
                prop: "timeoutSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                className: getColumnClassNameFn(),
                heading: getColumnHeadingFn(i18nMark("Max Failures")),
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
                    <a
                      className="button button-link flush table-display-on-row-hover"
                      onClick={onEditClick.bind(null, "healthChecks")}
                    >
                      <Trans>Edit</Trans>
                    </a>
                  );
                }
              });
            }

            if (serviceEndpointHealthChecks.length === 0) {
              return null;
            }

            return [
              <Trans
                render={
                  <ConfigurationMapHeading
                    key="service-endpoint-health-checks-heading"
                    level={2}
                  />
                }
              >
                Service Endpoint Health Checks
              </Trans>,
              <Table
                key="service-endpoint-health-checks"
                className="table table-flush table-borderless-outer table-borderless-inner-columns vertical-align-top table-break-word table-fixed-layout flush-bottom"
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
                heading: getColumnHeadingFn(i18nMark("Command")),
                prop: "command",
                render: (prop, row) => {
                  const command = row[prop] || {};
                  const value = getDisplayValue(command.value);
                  if (!command.value) {
                    return value;
                  }

                  return (
                    <ConfigurationMapValue>
                      <pre className="flush transparent wrap">{value}</pre>
                    </ConfigurationMapValue>
                  );
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn(i18nMark("Grace Period")),
                prop: "gracePeriodSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn(i18nMark("Interval")),
                prop: "intervalSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                heading: getColumnHeadingFn(i18nMark("Timeout")),
                prop: "timeoutSeconds",
                className: getColumnClassNameFn(),
                render: renderDuration,
                sortable: true
              },
              {
                className: getColumnClassNameFn(),
                heading: getColumnHeadingFn(i18nMark("Max Failures")),
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
                    <a
                      className="button button-link flush table-display-on-row-hover"
                      onClick={onEditClick.bind(null, "environment")}
                    >
                      <Trans>Edit</Trans>
                    </a>
                  );
                }
              });
            }

            if (commandHealthChecks.length === 0) {
              return null;
            }

            return [
              <Trans
                render={
                  <ConfigurationMapHeading
                    key="command-health-checks-heading"
                    level={2}
                  />
                }
              >
                Command Health Checks
              </Trans>,
              <Table
                key="command-health-checks"
                className="table table-flush table-borderless-outer table-borderless-inner-columns vertical-align-top table-break-word table-fixed-layout flush-bottom"
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

export default ServiceHealthChecksConfigSection;
