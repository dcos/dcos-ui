import React from 'react';
import {Table} from 'reactjs-components';

import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = {
  values: [
    {
      key: 'secrets',
      heading: 'Secrets',
      headingLevel: 1
    },
    {
      key: 'secrets',
      render: (secretsData) => {
        const columns = [
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn(),
            prop: 'secret',
            render: (prop, row) => {
              return <code>{row[prop]}</code>;
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(
              'configuration-map-table-label'
            ),
            sortable: true
          },
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn(),
            prop: 'secretName',
            render: (prop, row) => {
              return (
                <code>
                  {ServiceConfigDisplayUtil.getDisplayValue(row[prop])}
                </code>
              );
            },
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(
              'configuration-map-table-value'
            ),
            sortable: true
          }
        ];

        const data = Object.keys(secretsData).map((secretKey) => {
          return {
            secret: secretKey,
            secretName: secretsData[secretKey].source
          };
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
