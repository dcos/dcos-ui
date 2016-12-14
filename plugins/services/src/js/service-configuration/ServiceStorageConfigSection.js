import React from 'react';
import {Table} from 'reactjs-components';

import {formatResource} from '../../../../../src/js/utils/Units';
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from '../utils/ServiceConfigDisplayUtil';

module.exports = {
  tabViewID: 'volumes',
  values: [
    {
      key: 'container.volumes',
      heading: 'Storage',
      headingLevel: 1
    },
    {
      key: 'container.volumes',
      render(volumes, appConfig, editLink) {
        if (volumes == null) {
          return null;
        }

        const columns = [
          {
            heading: getColumnHeadingFn('Volume'),
            prop: 'volume',
            render(prop, row) {
              let name = '';

              if (row.name != null) {
                name = ` (${row.name})`;
              }

              return `${row.type.join(' ')}${name}`;
            },
            className: getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Size'),
            prop: 'size',
            render(prop, row) {
              let value = row[prop];

              if (value == null) {
                return getDisplayValue(value);
              }

              return formatResource('disk', value);
            },
            className: getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Mode'),
            prop: 'mode',
            className: getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: getColumnHeadingFn('Container Mount Path'),
            prop: 'containerPath',
            className: getColumnClassNameFn(),
            sortable: true
          }
        ];

        let shouldDisplayHostPath = false;

        const volumesData = volumes.map((appVolume) => {
          // We don't want to mutate the appVolume value.
          let volume = {
            name: null,
            size: null,
            type: []
          };

          volume.containerPath = appVolume.containerPath;
          volume.mode = appVolume.mode;

          if (appVolume.persistent != null) {
            volume.size = appVolume.persistent.size;
            volume.type.push('Persistent', 'Local');
          } else if (appVolume.external != null) {
            volume.type.push('External');
          } else {
            volume.type.push('Host', 'Volume');
          }

          if (appVolume.external != null) {
            volume.name = appVolume.external.name;
          }

          if (appVolume.hostPath != null) {
            // Set this flag to true so that we render the hostPath column.
            shouldDisplayHostPath = true;
          }

          volume.hostPath = getDisplayValue(appVolume.hostPath);

          return volume;
        });

        if (shouldDisplayHostPath) {
          columns.push({
            heading: getColumnHeadingFn('Host Path'),
            prop: 'hostPath',
            className: getColumnClassNameFn(),
            sortable: true
          });
        }

        if (editLink) {
          columns.push({
            heading() { return null; },
            className: 'text-align-right configuration-map-action',
            prop: 'edit',
            render() { return editLink; }
          });
        }

        return (
          <Table
            key="service-volumes"
            className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
            columns={columns}
            data={volumesData} />
        );
      }
    }
  ]
};
