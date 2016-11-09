import React from 'react';
import {Table} from 'reactjs-components';

import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = {
  values: [
    {
      key: 'labels',
      heading: 'Labels',
      headingLevel: 1
    },
    {
      key: 'labels',
      render: (labelsDataMap) => {
        const columns = [
          {
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn(),
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
            heading: ServiceConfigDisplayUtil.getColumnHeadingFn(),
            prop: 'value',
            className: ServiceConfigDisplayUtil.getColumnClassNameFn(
              'configuration-map-table-value'
            ),
            sortable: true
          }
        ];

        const data = Object.keys(labelsDataMap).reduce((memo, labelKey) => {
          let value = ServiceConfigDisplayUtil
            .getDisplayValue(labelsDataMap[labelKey]);

          memo.push({key: labelKey, value});

          return memo;
        }, []);

        return (
          <Table key="labels-table"
            className="table table-simple table-break-word flush-bottom"
            columns={columns}
            data={data} />
        );
      }

    }
  ]
};
