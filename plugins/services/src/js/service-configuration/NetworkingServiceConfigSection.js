import React from 'react';
import {Table} from 'reactjs-components';

import Networking from '../../../../../src/js/constants/Networking';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import HostUtil from '../utils/HostUtil';
import Util from '../../../../../src/js/utils/Util';

module.exports = {
  values: [
    // {
    //   heading: 'Network',
    //   headingLevel: 1
    // },
    // {
    //   label: 'Network Type',
    //   transformValue: () => {
    //     // TODO: Figure out how to determine this value.
    //     return 'network type';
    //   }
    // },
    // {
    //   label: 'Load Balancer Type',
    //   transformValue: () => {
    //     // TODO: Figure out how to determine this value.
    //     return 'load balancer type';
    //   }
    // },
    // {
    //   label: 'Ext. Load Balancer',
    //   transformValue: () => {
    //     // TODO: Figure out how to determine this value.
    //     return 'ext. load balancer';
    //   }
    // },
    {
      heading: 'Service Endpoints',
      headingLevel: 2
    },
    {
      key: 'portDefinitions',
      render: (portDefinitions, appDefinition) => {
        const keys = {
          name: 'name',
          port: 'port',
          protocol: 'protocol'
        };

        let containerPortMappings = Util.findNestedPropertyInObject(
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
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Name'),
            prop: keys.name,
            render: (prop, row) => {
              return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Protocol'),
            prop: keys.protocol,
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: (prop, row) => {
              return ServiceConfigDisplayUtil.getDisplayValue(row[prop])
                .split(',').join(', ');
            },
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Port'),
            prop: keys.port,
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            render: (prop, row) => {
              // TODO: Figure out how to determine static or dynamic port.
              return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
            },
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil
              .getColumnHeadingFn('Load Balanced Address'),
            prop: '',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
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

        return (
          <Table key="service-endpoints"
            className="table table-simple table-break-word flush-bottom"
            columns={columns}
            data={portDefinitions} />
        );
      }
    }
  ]
};
