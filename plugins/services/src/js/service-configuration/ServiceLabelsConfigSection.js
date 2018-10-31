import React from "react";
import { Table } from "reactjs-components";

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
  getMountType() {
    return "CreateService:ServiceConfigDisplay:App:Labels";
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
                heading: ServiceConfigDisplayUtil.getColumnHeadingFn("Key"),
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
                heading: ServiceConfigDisplayUtil.getColumnHeadingFn("Value"),
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
                    <a
                      className="button button-link flush table-display-on-row-hover"
                      onClick={onEditClick.bind(null, "environment")}
                    >
                      Edit
                    </a>
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
                className="table table-flush table-borderless-outer table-borderless-inner-columns vertical-align-top table-break-word flush-bottom"
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
