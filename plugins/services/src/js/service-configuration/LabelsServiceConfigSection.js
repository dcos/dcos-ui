import React from 'react';
import {Table} from 'reactjs-components';

import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = {
  tabViewID: 'environment',
  values: [
    {
      key: 'labels',
      heading: 'Labels',
      headingLevel: 1
    },
    {
      key: 'labels',
      render: (labelsDataMap, appConfig, editLink) => {
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

        if (editLink) {
          columns.push({
            heading() { return null; },
            className: 'configuration-map-action',
            prop: 'edit',
            render() { return editLink; }
          });
        }

        const data = Object.keys(labelsDataMap).reduce((memo, labelKey) => {
          let value = ServiceConfigDisplayUtil.getDisplayValue(
            labelsDataMap[labelKey]
          );

          memo.push({key: labelKey, value});

          return memo;
        }, []);

        return (
          <Table
            key="labels-table"
            className="table table-simple table-align-top table-break-word table-align-top table-fixed-layout flush-bottom"
            columns={columns}
            data={data} />
        );
      }
    }
  ]
};
