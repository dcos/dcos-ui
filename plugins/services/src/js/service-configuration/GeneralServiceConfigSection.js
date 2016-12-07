import React from 'react';
import {Table} from 'reactjs-components';

import ContainerConstants from '../constants/ContainerConstants';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import Units from '../../../../../src/js/utils/Units';
import Util from '../../../../../src/js/utils/Util';

const {type: {NONE}, labelMap} = ContainerConstants;

module.exports = {
  values: [
    {
      heading: 'General',
      headingLevel: 1
    },
    {
      key: 'id',
      label: 'Service ID',
      transformValue: (value) => {
        return value.split('/').pop();
      }
    },
    {
      key: 'instances',
      label: 'Instances'
    },
    {
      key: 'location',
      label: 'Location',
      transformValue: (value, appDefinition) => {
        let idSegments = Util.findNestedPropertyInObject(appDefinition, 'id').split('/');

        idSegments.pop();

        return `${idSegments.join('/')}/`;
      }
    },
    {
      key: 'container.type',
      label: 'Container Runtime',
      transformValue: (runtime) => {
        return labelMap[runtime] || labelMap[NONE];
      }
    },
    {
      key: 'cpus',
      label: 'CPU'
    },
    {
      key: 'mem',
      label: 'Memory',
      transformValue: (value) => {
        if (value == null) {
          return ServiceConfigDisplayUtil.getDisplayValue(value);
        }

        return Units.formatResource('mem', value);
      }
    },
    {
      key: 'disk',
      label: 'Disk',
      transformValue: (value) => {
        if (value == null) {
          return ServiceConfigDisplayUtil.getDisplayValue(value);
        }

        return Units.formatResource('disk', value);
      }
    },
    {
      key: 'gpus',
      label: 'GPU'
    },
    {
      key: 'backoffSeconds',
      label: 'Backoff Seconds'
    },
    {
      key: 'backoffFactor',
      label: 'Backoff Factor'
    },
    {
      key: 'maxLaunchDelaySeconds',
      label: 'Backoff Max Launch Delay'
    },
    {
      key: 'minHealthOpacity',
      label: 'Upgrade Min Health Capacity'
    },
    {
      key: 'maxOverCapacity',
      label: 'Upgrade Max Overcapacity'
    },
    {
      key: 'container.docker.image',
      label: 'Container Image'
    },
    {
      key: 'container.docker.privileged',
      label: 'Extended Runtime Priv.',
      transformValue: (value) => {
        // Cast boolean as a string.
        return String(Boolean(value));
      }
    },
    {
      key: 'container.docker.forcePullImage',
      label: 'Force Pull on Launch',
      transformValue: (value) => {
        // Cast boolean as a string.
        return String(Boolean(value));
      }
    },
    {
      key: 'cmd',
      label: 'Command',
      type: 'pre'
    },
    {
      key: 'acceptedResourceRoles',
      label: 'Resource Roles',
      transformValue: (value = []) => {
        return value.join(', ');
      }
    },
    {
      key: 'dependencies',
      label: 'Dependencies',
      transformValue: (value = []) => {
        return value.join(', ');
      }
    },
    {
      key: 'executor',
      label: 'Executor'
    },
    {
      key: 'user',
      label: 'User'
    },
    {
      key: 'args',
      label: 'Args',
      transformValue: (value = []) => {
        if (!value.length) {
          return String.fromCharCode(8212);
        }

        return value.map((arg) => (
          <pre className="flush transparent wrap">{arg}</pre>
        ));
      }
    },
    {
      key: 'version',
      label: 'Version'
    },
    {
      key: 'fetch',
      heading: 'Container Artifacts',
      headingLevel: 3
    },
    {
      key: 'fetch',
      render: (data) => {
        const columns = [
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Artifact Uri'),
            prop: 'uri',
            render: (prop, row) => {
              let value = row[prop];

              return ServiceConfigDisplayUtil.getDisplayValue(value);
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(
              'configuration-map-table-label'
            ),
            sortable: true
          }
        ];

        return (
          <Table
            key="artifacts-table"
            className="table table-simple table-break-word flush-bottom"
            columns={columns}
            data={data} />
        );
      }
    }
  ]
};
