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

import { JobOutput, JobLabels } from "../form/helpers/JobFormData";

interface KeyValue {
  key: string;
  value: string;
}

class LabelsConfigSection extends BaseConfig<JobOutput> {
  shouldExcludeItem(_: Value<JobOutput>) {
    const { labels } = this.props.config;

    return labels == null || Object.keys(labels).length === 0;
  }

  getMountType() {
    return "CreateJob:JobConfigDisplay:App:Labels";
  }

  getDefinition() {
    return {
      tabViewID: "labels",
      values: [
        {
          heading: <Trans>Labels</Trans>,
          headingLevel: 1
        },
        {
          key: "labels",
          render(labels: JobLabels) {
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

            const data = Object.keys(labels).reduce(
              (memo, labelKey) => {
                const value = getDisplayValue(labels[labelKey]);

                memo.push({ key: labelKey, value });

                return memo;
              },
              [] as KeyValue[]
            );

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

export default LabelsConfigSection;
