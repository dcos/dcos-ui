import React from 'react';
import {Table} from 'reactjs-components';

import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = {
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
      render: (healthChecks) => {
        let serviceEndpointHealthChecks = healthChecks.filter(
          (healthCheck) => {
            return healthCheck.protocol === 'HTTP'
              || healthCheck.protocol === 'TCP';
          }
        );

        const columns = [
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Protocol'),
            prop: 'protocol',
            render: (prop, row) => {
              return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Path'),
            prop: 'path',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: (prop, row) => {
              return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
            },
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil
              .getColumnHeadingFn('Grace Period'),
            prop: 'gracePeriodSeconds',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: ServiceConfigDisplayUtil.renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Interval'),
            prop: 'intervalSeconds',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: ServiceConfigDisplayUtil.renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Timeout'),
            prop: 'timeoutSeconds',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: ServiceConfigDisplayUtil.renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil
              .getColumnHeadingFn('Max Failures'),
            prop: 'maxConsecutiveFailures',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          }
        ];

        return (
          <Table key="service-endpoint-health-checks"
            className="table table-simple table-break-word flush-bottom"
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
      render: (healthChecks) => {
        let commandHealthChecks = healthChecks.filter((healthCheck) => {
          return healthCheck.protocol === 'COMMAND';
        });

        const columns = [
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Command'),
            prop: 'command',
            render: (prop, row) => {
              let command = row[prop] || {};

              return (
                <pre className="flush transparent wrap">
                  {ServiceConfigDisplayUtil.getDisplayValue(command.value)}
                </pre>
              );
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil
              .getColumnHeadingFn('Grace Period'),
            prop: 'gracePeriodSeconds',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: ServiceConfigDisplayUtil.renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Interval'),
            prop: 'intervalSeconds',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: ServiceConfigDisplayUtil.renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Timeout'),
            prop: 'timeoutSeconds',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: ServiceConfigDisplayUtil.renderMillisecondsFromSeconds,
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil
              .getColumnHeadingFn('Max Failures'),
            prop: 'maxConsecutiveFailures',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          }
        ];

        return (
          <Table key="command-health-checks"
            className="table table-simple table-break-word flush-bottom"
            columns={columns}
            data={commandHealthChecks} />
        );
      }
    }
  ]
};
