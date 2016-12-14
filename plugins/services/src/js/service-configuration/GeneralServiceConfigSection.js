import React from 'react';
import {Table} from 'reactjs-components';

import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import {formatResource} from '../../../../../src/js/utils/Units';
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from '../utils/ServiceConfigDisplayUtil';
import ContainerConstants from '../constants/ContainerConstants';

const {type: {DOCKER, NONE}, labelMap} = ContainerConstants;

module.exports = {
  tabViewID: 'services',
  values: [
    {
      heading: 'General',
      headingLevel: 1
    },
    {
      key: 'id',
      label: 'Service ID'
    },
    {
      key: 'instances',
      label: 'Instances'
    },
    {
      key: 'container.type',
      label: 'Container Runtime',
      transformValue(runtime) {
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
      transformValue(value) {
        if (value == null) {
          return value;
        }

        return formatResource('mem', value);
      }
    },
    {
      key: 'disk',
      label: 'Disk',
      transformValue(value) {
        if (value == null) {
          return value;
        }

        return formatResource('disk', value);
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
      label: 'Container Image',
      transformValue(value, appConfig) {
        const runtime = findNestedPropertyInObject(appConfig, 'container.type');
        // Disabled for NONE
        return getDisplayValue(value, runtime == null || runtime === NONE);
      }
    },
    {
      key: 'container.docker.privileged',
      label: 'Extended Runtime Priv.',
      transformValue(value, appConfig) {
        const runtime = findNestedPropertyInObject(appConfig, 'container.type');
        // Disabled for DOCKER
        if (runtime !== DOCKER && value == null) {
          return getDisplayValue(null, true);
        }

        // Cast boolean as a string.
        return String(Boolean(value));
      }
    },
    {
      key: 'container.docker.forcePullImage',
      label: 'Force Pull on Launch',
      transformValue(value, appConfig) {
        const runtime = findNestedPropertyInObject(appConfig, 'container.type');
        // Disabled for DOCKER
        if (runtime !== DOCKER && value == null) {
          return getDisplayValue(null, true);
        }

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
      transformValue(value = []) {
        return value.join(', ');
      }
    },
    {
      key: 'dependencies',
      label: 'Dependencies',
      transformValue(value = []) {
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
      transformValue(value = []) {
        if (!value.length) {
          return getDisplayValue(null);
        }

        return value.map((arg, index) => (
          <pre key={index} className="flush transparent wrap">{arg}</pre>
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
      render: (data, appConfig, editLink) => {
        const columns = [
          {
            heading: getColumnHeadingFn('Artifact Uri'),
            prop: 'uri',
            render: (prop, row) => {
              let value = row[prop];

              return getDisplayValue(value);
            },
            className: getColumnClassNameFn(
              'configuration-map-table-label'
            ),
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
            key="artifacts-table"
            className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
            columns={columns}
            data={data} />
        );
      }
    }
  ]
};
