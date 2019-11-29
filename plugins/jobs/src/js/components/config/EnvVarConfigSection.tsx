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

import { JobOutput, JobEnv } from "../form/helpers/JobFormData";

interface KeyValue {
  key: string;
  value: string;
}

class EnvVarConfigSection extends BaseConfig<JobOutput> {
  shouldExcludeItem(_: Value<JobOutput>) {
    const {
      run: { env }
    } = this.props.config;

    return (
      env == null ||
      Object.keys(env).filter(key => typeof env[key] !== "object").length === 0
    );
  }

  getMountType() {
    return "CreateJob:JobConfigDisplay:App:Env";
  }

  getDefinition() {
    return {
      tabViewID: "env",
      values: [
        {
          heading: <Trans>Environment Variables</Trans>,
          headingLevel: 1
        },
        {
          key: "run.env",
          render(env: JobEnv) {
            const columns = [
              {
                heading: getColumnHeadingFn(i18nMark("Key")),
                prop: "key",
                render: (prop: string, row: KeyValue) => {
                  return <code>{row[prop as keyof KeyValue]}</code>;
                },
                className: getColumnClassNameFn(
                  "configuration-map-table-label"
                ),
                sortable: true
              },
              {
                heading: getColumnHeadingFn(i18nMark("Value")),
                prop: "value",
                className: getColumnClassNameFn(
                  "configuration-map-table-value"
                ),
                sortable: true
              }
            ];

            const data = Object.keys(env).reduce((memo, envKey) => {
              const value = getDisplayValue(env[envKey]);

              if (typeof value === "string") {
                memo.push({ key: envKey, value });
              }

              return memo;
            }, [] as KeyValue[]);

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

export default EnvVarConfigSection;
