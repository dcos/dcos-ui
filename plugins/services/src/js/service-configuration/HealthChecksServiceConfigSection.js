import React from 'react';
import {Table} from 'reactjs-components';

import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue,
  renderMillisecondsFromSeconds
} from '../utils/ServiceConfigDisplayUtil';

module.exports = {
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
      render: (healthChecks, appConfig, editLink) => {
        let serviceEndpointHealthChecks = healthChecks.filter(
          (healthCheck) => {
            return ['HTTP', 'HTTPS', 'TCP'].includes(healthCheck.protocol);
          }
        );

        const columns = [
          {
            heading: getColumnHeadingFn('Protocol'),
            prop: 'protocol',
            render: (prop, row) => {
              return getDisplayValue(row[prop]);
            },
            className: getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Path'),
            prop: 'path',
            className: getColumnClassNameFn(),
            render: (prop, row) => {
              return getDisplayValue(row[prop]);
            },
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Grace Period'),
            prop: 'gracePeriodSeconds',
            className: getColumnClassNameFn(),
            render: renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Interval'),
            prop: 'intervalSeconds',
            className: getColumnClassNameFn(),
            render: renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Timeout'),
            prop: 'timeoutSeconds',
            className: getColumnClassNameFn(),
            render: renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Max Failures'),
            prop: 'maxConsecutiveFailures',
            className: getColumnClassNameFn(),
            sortable: true
          }
        ];

        if (editLink) {
          columns.push({
            heading() { return null; },
            className: 'configuration-map-action',
            prop: 'edit',
            render() { return editLink; }
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
      render: (healthChecks, appConfig, editLink) => {
        let commandHealthChecks = healthChecks.filter((healthCheck) => {
          return healthCheck.protocol === 'COMMAND';
        });

        const columns = [
          {
            heading: getColumnHeadingFn('Command'),
            prop: 'command',
            render: (prop, row) => {
              let command = row[prop] || {};
              let value = getDisplayValue(command.value);
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
            render: renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Interval'),
            prop: 'intervalSeconds',
            className: getColumnClassNameFn(),
            render: renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Timeout'),
            prop: 'timeoutSeconds',
            className: getColumnClassNameFn(),
            render: renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Max Failures'),
            prop: 'maxConsecutiveFailures',
            className: getColumnClassNameFn(),
            sortable: true
          }
        ];

        if (editLink) {
          columns.push({
            heading() { return null; },
            className: 'configuration-map-action',
            prop: 'edit',
            render() { return editLink; }
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
