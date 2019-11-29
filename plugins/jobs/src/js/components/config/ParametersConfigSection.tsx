import * as React from "react";
import { i18nMark } from "@lingui/react";
import { Table } from "reactjs-components";
import { Trans } from "@lingui/macro";

import BaseConfig, { Value } from "#SRC/js/components/BaseConfig";
import {
  getColumnHeadingFn,
  getColumnClassNameFn,
  getDisplayValue
} from "#SRC/js/utils/ConfigDisplayUtil";

import { JobOutput, DockerParameter } from "../form/helpers/JobFormData";

class ContainerConfigSection extends BaseConfig<JobOutput> {
  shouldExcludeItem(_: Value<JobOutput>) {
    const { config } = this.props;
    return (
      !config.run.docker ||
      !config.run.docker ||
      !config.run.docker.parameters ||
      !config.run.docker.parameters.length
    );
  }

  getMountType() {
    return "CreateJob:JobConfigDisplay:App:Parameters";
  }

  getDefinition() {
    return {
      tabViewID: "parameters",
      values: [
        {
          heading: <Trans>Parameters</Trans>,
          headingLevel: 2
        },
        {
          key: "run.docker.parameters",
          render(parameters: DockerParameter[]) {
            const columns = [
              {
                heading: getColumnHeadingFn(i18nMark("Key")),
                prop: "key",
                render: (prop: string, row: DockerParameter) => {
                  return <code>{row[prop as keyof DockerParameter]}</code>;
                },
                className: getColumnClassNameFn(
                  "configuration-map-table-label"
                ),
                sortable: true
              },
              {
                heading: getColumnHeadingFn(i18nMark("Value")),
                prop: "value",
                render: (prop: string, row: DockerParameter) => {
                  const value = row[prop as keyof DockerParameter];

                  return getDisplayValue(value);
                },
                className: getColumnClassNameFn(
                  "configuration-map-table-value"
                ),
                sortable: true
              }
            ];

            return (
              <Table
                key="secrets-table"
                className="table table-flush table-borderless-outer table-borderless-inner-columns vertical-align-top table-break-word flush-bottom"
                columns={columns}
                data={parameters}
              />
            );
          }
        }
      ]
    };
  }
}

export default ContainerConfigSection;
