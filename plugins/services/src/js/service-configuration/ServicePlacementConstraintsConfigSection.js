import React from 'react';
import {Table} from 'reactjs-components';

import ConfigurationMapEditAction from '../components/ConfigurationMapEditAction';
import ServiceConfigBaseSectionDisplay from './ServiceConfigBaseSectionDisplay';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

class ServicePlacementConstraintsConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
  * @override
  */
  shouldExcludeItem() {
    return this.props.appConfig.constraints == null ||
      this.props.appConfig.constraints.length === 0;
  }

  /**
   * @override
   */
  getDefinition() {
    const {onEditClick} = this.props;

    return {
      tabViewID: 'services',
      values: [
        {
          key: 'constraints',
          heading: 'Placement Constraints',
          headingLevel: 2
        },
        {
          key: 'constraints',
          render(data) {
            const columns = [
              {
                heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Field Name'),
                prop: 'field',
                render(prop, row) {
                  const value = row[prop];

                  return ServiceConfigDisplayUtil.getDisplayValue(value);
                },
                className: ServiceConfigDisplayUtil.getColumnClassNameFn(
                  'configuration-map-table-label'
                ),
                sortable: true
              },
              {
                heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Operator'),
                prop: 'operator',
                render(prop, row) {
                  const value = row[prop];

                  return ServiceConfigDisplayUtil.getDisplayValue(value);
                },
                className: ServiceConfigDisplayUtil.getColumnClassNameFn(
                  'configuration-map-table-value'
                ),
                sortable: true
              },
              {
                heading: ServiceConfigDisplayUtil.getColumnHeadingFn('Value'),
                prop: 'value',
                render(prop, row) {
                  const value = row[prop];

                  return ServiceConfigDisplayUtil.getDisplayValue(value);
                },
                className: ServiceConfigDisplayUtil.getColumnClassNameFn(
                  'configuration-map-table-value'
                ),
                sortable: true
              }
            ];

            if (onEditClick) {
              columns.push({
                heading() { return null; },
                className: 'configuration-map-action',
                prop: 'edit',
                render() {
                  return (
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="services" />
                  );
                }
              });
            }

            const mappedData = data.map((item) => {
              return {field: item[0], operator: item[1], value: item[2]};
            });

            return (
              <Table
                key="constraints-table"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={mappedData} />
            );
          }
        }
      ]
    };
  }
}

module.exports = ServicePlacementConstraintsConfigSection;
