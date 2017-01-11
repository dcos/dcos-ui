import React from 'react';
import {Table} from 'reactjs-components';

import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from '../utils/ServiceConfigDisplayUtil';
import ConfigurationMapEditAction from '../components/ConfigurationMapEditAction';
import ConfigurationMapDurationValue from '../components/ConfigurationMapDurationValue';
import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import {COMMAND, MESOS_HTTP, MESOS_HTTPS} from '../constants/HealthCheckProtocols';
import Util from '../../../../../src/js/utils/Util';

class ServiceHealthChecksConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem() {
    const {appConfig} = this.props;

    return !Util.findNestedPropertyInObject(appConfig, 'healthChecks.length');
  }

  /**
   * @override
   */
  getDefinition() {
    const {onEditClick} = this.props;

    return {
      tabViewID: 'healthChecks',
      values: [
        {
          key: 'healthChecks',
          heading: 'Health Checks',
          headingLevel: 1
        },
        {
          key: 'healthChecks',
          heading: 'Service Endpoint Health Checks',
          headingLevel: 2
        },
        {
          key: 'healthChecks',
          render(healthChecks) {
            const serviceEndpointHealthChecks = healthChecks.filter(
              (healthCheck) => {
                return [MESOS_HTTP, MESOS_HTTPS, COMMAND].includes(healthCheck.protocol);
              }
            );

            const columns = [
              {
                heading: getColumnHeadingFn('Protocol'),
                prop: 'protocol',
                render(prop, row) {
                  return getDisplayValue(row[prop]);
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Path'),
                prop: 'path',
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return getDisplayValue(row[prop]);
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Grace Period'),
                prop: 'gracePeriodSeconds',
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return (
                    <ConfigurationMapDurationValue
                      units="sec"
                      value={row[prop]} />
                  );
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Interval'),
                prop: 'intervalSeconds',
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return (
                    <ConfigurationMapDurationValue
                      units="sec"
                      value={row[prop]} />
                  );
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Timeout'),
                prop: 'timeoutSeconds',
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return (
                    <ConfigurationMapDurationValue
                      units="sec"
                      value={row[prop]} />
                  );
                },
                sortable: true
              },
              {
                className: getColumnClassNameFn(),
                heading: getColumnHeadingFn('Max Failures'),
                prop: 'maxConsecutiveFailures',
                render(prop, row) {
                  return getDisplayValue(row[prop]);
                },
                sortable: true
              }
            ];

            if (onEditClick) {
              columns.push({
                heading() { return null; },
                className: 'configuration-map-action',
                prop: 'edit',
                render() {
                  return (
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="healthChecks" />
                  );
                }
              });
            }

            return (
              <Table
                key="service-endpoint-health-checks"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={serviceEndpointHealthChecks} />
            );
          }
        },
        {
          heading: 'Command Health Checks',
          headingLevel: 2
        },
        {
          key: 'healthChecks',
          render(healthChecks) {
            const commandHealthChecks = healthChecks.filter((healthCheck) => {
              return healthCheck.protocol === COMMAND;
            });

            const columns = [
              {
                heading: getColumnHeadingFn('Command'),
                prop: 'command',
                render: (prop, row) => {
                  const command = row[prop] || {};
                  const value = getDisplayValue(command.value);
                  if (!command.value) {
                    return value;
                  }

                  return (
                    <pre className="flush transparent wrap">
                      {value}
                    </pre>
                  );
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Grace Period'),
                prop: 'gracePeriodSeconds',
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return (
                    <ConfigurationMapDurationValue
                      units="sec"
                      value={row[prop]} />
                  );
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Interval'),
                prop: 'intervalSeconds',
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return (
                    <ConfigurationMapDurationValue
                      units="sec"
                      value={row[prop]} />
                  );
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Timeout'),
                prop: 'timeoutSeconds',
                className: getColumnClassNameFn(),
                render(prop, row) {
                  return (
                    <ConfigurationMapDurationValue
                      units="sec"
                      value={row[prop]} />
                  );
                },
                sortable: true
              },
              {
                className: getColumnClassNameFn(),
                heading: getColumnHeadingFn('Max Failures'),
                prop: 'maxConsecutiveFailures',
                render(prop, row) {
                  return getDisplayValue(row[prop]);
                },
                sortable: true
              }
            ];

            if (onEditClick) {
              columns.push({
                heading() { return null; },
                className: 'configuration-map-action',
                prop: 'edit',
                render() {
                  return (
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="environment" />
                  );
                }
              });
            }

            return (
              <Table
                key="command-health-checks"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={commandHealthChecks} />
            );
          }
        }
      ]
    };
  }
}

module.exports = ServiceHealthChecksConfigSection;
