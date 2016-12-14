import React from 'react';
import {Table} from 'reactjs-components';

import Networking from '../../../../../src/js/constants/Networking';
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from '../utils/ServiceConfigDisplayUtil';
import HostUtil from '../utils/HostUtil';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';

module.exports = {
  tabViewID: 'networking',
  values: [
    {
      heading: 'Network',
      headingLevel: 1
    },
    {
      key: 'container.docker.network',
      label: 'Network Type',
      transformValue: (network) => {
        return network || Networking.type.HOST;
      }
    },
    {
      key: 'ipAddress.networkName',
      label: 'Network Name'
    },
    {
      heading: 'Service Endpoints',
      headingLevel: 2
    },
    {
      key: 'portDefinitions',
      render: (portDefinitions, appDefinition, editLink) => {
        const keys = {
          name: 'name',
          port: 'port',
          protocol: 'protocol'
        };

        let containerPortMappings = findNestedPropertyInObject(
          appDefinition, 'container.docker.portMappings'
        );
        if ((portDefinitions == null || portDefinitions.length === 0) &&
          containerPortMappings != null && containerPortMappings.length !== 0) {
          portDefinitions = containerPortMappings;
          keys.port = 'containerPort';
        }

        // Make sure to have something to render, even if there is no data
        if (!portDefinitions) {
          portDefinitions = [];
        }

        const columns = [
          {
            heading: getColumnHeadingFn('Name'),
            prop: keys.name,
            render: (prop, row) => {
              return getDisplayValue(row[prop]);
            },
            className: getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Protocol'),
            prop: keys.protocol,
            className: getColumnClassNameFn(),
            render: (prop, row) => {
              return getDisplayValue(row[prop])
                .split(',').join(', ');
            },
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Port'),
            prop: keys.port,
            className: getColumnClassNameFn(),
            render: (prop, row) => {
              // TODO: Figure out how to determine static or dynamic port.
              return getDisplayValue(row[prop]);
            },
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Load Balanced Address'),
            prop: '',
            className: getColumnClassNameFn(),
            render: (prop, row) => {
              // TODO: Only render this when necessary, figure out when
              // necessary.
              let hostname = HostUtil.stringToHostname(appDefinition.id);
              let port = row[keys.port];

              return `${hostname}${Networking.L4LB_ADDRESS}:${port}`;
            },
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
            key="service-endpoints"
            className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
            columns={columns}
            data={portDefinitions} />
        );
      }
    }
  ]
};
