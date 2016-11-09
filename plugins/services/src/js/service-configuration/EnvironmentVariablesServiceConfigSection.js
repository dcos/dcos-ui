import React from 'react';
import {Table} from 'reactjs-components';

import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = {
  values: [
    {
      key: 'env',
      heading: 'Environment Variables',
      headingLevel: 1
    },
    {
      key: 'env',
      render: (envData, appDefinition) => {
        const columns = [
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Key'),
            prop: 'key',
            render: (prop, row) => {
              return <code>{row[prop]}</code>;
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(
              'configuration-map-table-label'
            ),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Value'),
            prop: 'value',
            render: (prop, row) => {
              let value = row[prop];

              if (value.secret != null) {
                let specifiedSecret =
                  appDefinition.secrets[value.secret] || {};

                return (
                  <code>{specifiedSecret.source}</code>
                );
              }

              return ServiceConfigDisplayUtil.getDisplayValue(value);
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(
              'configuration-map-table-value'
            ),
            sortable: true
          }
        ];

        const data = Object.keys(envData).map((envKey) => {
          return {key: envKey, value: envData[envKey]};
        });

        return (
          <Table key="secrets-table"
            className="table table-simple table-break-word flush-bottom"
            columns={columns}
            data={data} />
        );
      }
    }
  ]
};
