import React from 'react';
import {Table} from 'reactjs-components';

import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import Units from '../../../../../src/js/utils/Units';

module.exports = {
  values: [
    {
      key: 'container.volumes',
      heading: 'Storage',
      headingLevel: 1
    },
    {
      key: 'container.volumes',
      render: (volumes) => {
        if (volumes == null) {
          return null;
        }

        const columns = [
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Volume'),
            prop: 'volume',
            render: (prop, row) => {
              let name = '';

              if (row.name != null) {
                name = ` (${row.name})`;
              }

              return `${row.type.join(' ')}${name}`;
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Size'),
            prop: 'size',
            render: (prop, row) => {
              let value = row[prop];

              if (value == null) {
                return ServiceConfigDisplayUtil.getDisplayValue(value);
              }

              return Units.formatResource('disk', value);
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Mode'),
            prop: 'mode',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil
              .getColumnHeadingFn('Container Mount Path'),
            prop: 'containerPath',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
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
          } else {
            volume.type.push('External');
          }

          if (appVolume.external != null) {
            volume.name = appVolume.external.name;
          }

          if (appVolume.hostPath != null) {
            // Set this flag to true so that we render the hostPath column.
            shouldDisplayHostPath = true;
          }

          volume.hostPath =
            ServiceConfigDisplayUtil.getDisplayValue(appVolume.hostPath);

          return volume;
        });

        if (shouldDisplayHostPath) {
          columns.push({
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Host Path'),
            prop: 'hostPath',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(),
            sortable: true
          });
        }

        return (
          <Table key="service-volumes"
            className="table table-simple table-break-word flush-bottom"
            columns={columns}
            data={volumesData} />
        );
      }
    }
  ]
};
