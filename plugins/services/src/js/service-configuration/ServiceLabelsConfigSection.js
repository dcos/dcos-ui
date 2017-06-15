import React from "react";
import { Table } from "reactjs-components";

import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";

class ServiceLabelsConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
  * @override
  */
  shouldExcludeItem() {
    const { labels } = this.props.appConfig;

    return labels == null || Object.keys(labels).length === 0;
  }

  /**
   * @override
   */
  getDefinition() {
    const { onEditClick } = this.props;

    return {
      tabViewID: "environment",
      values: [
        {
          key: "labels",
          heading: "Labels",
          headingLevel: 1
        },
        {
          key: "labels",
          render(labelsDataMap) {
            const columns = [
              {
                heading: ServiceConfigDisplayUtil.getColumnHeadingFn(),
                prop: "key",
                render: (prop, row) => {
                  return <code>{row[prop]}</code>;
                },
                className: ServiceConfigDisplayUtil.getColumnClassNameFn(
                  "configuration-map-table-label"
                ),
                sortable: true
              },
              {
                heading: ServiceConfigDisplayUtil.getColumnHeadingFn(),
                prop: "value",
                className: ServiceConfigDisplayUtil.getColumnClassNameFn(
                  "configuration-map-table-value"
                ),
                sortable: true
              }
            ];

            if (onEditClick) {
              columns.push({
                heading() {
                  return null;
                },
                className: "configuration-map-action",
                prop: "edit",
                render() {
                  return (
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="environment"
                    />
                  );
                }
              });
            }

            const data = Object.keys(labelsDataMap).reduce((memo, labelKey) => {
              const value = ServiceConfigDisplayUtil.getDisplayValue(
                labelsDataMap[labelKey]
              );

              memo.push({ key: labelKey, value });

              return memo;
            }, []);

            return (
              <Table
                key="labels-table"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={data}
              />
            );
          }
        }
      ]
    };
  }
}

module.exports = ServiceLabelsConfigSection;
