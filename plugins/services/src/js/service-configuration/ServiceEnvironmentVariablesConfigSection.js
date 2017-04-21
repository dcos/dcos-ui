import React from "react";
import { Table } from "reactjs-components";

import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";

class ServiceEnvironmentVariablesConfigSection
  extends ServiceConfigBaseSectionDisplay {
  /**
  * @override
  */
  shouldExcludeItem() {
    const { appConfig: { env } } = this.props;

    return (
      env == null ||
      Object.keys(env).length === 0 ||
      Object.keys(env).every(key => typeof env[key] !== "string")
    );
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
          key: "env",
          heading: "Environment Variables",
          headingLevel: 1
        },
        {
          key: "env",
          render(envData) {
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
                render: (prop, row) => {
                  const value = row[prop];

                  return ServiceConfigDisplayUtil.getDisplayValue(value);
                },
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

            const data = Object.keys(envData)
              .map(envKey => {
                return { key: envKey, value: envData[envKey] };
              })
              .filter(function({ value }) {
                return typeof value === "string";
              });

            return (
              <Table
                key="secrets-table"
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

module.exports = ServiceEnvironmentVariablesConfigSection;
