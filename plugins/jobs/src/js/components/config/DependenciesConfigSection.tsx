import * as React from "react";
import { Trans } from "@lingui/macro";

import BaseConfig, { Value } from "#SRC/js/components/BaseConfig";
import { JobOutput } from "../form/helpers/JobFormData";
import { BorderedList } from "@dcos/ui-kit";
import { Link } from "react-router";

export default class DependenciesConfigSection extends BaseConfig<JobOutput> {
  shouldExcludeItem(_: Value<JobOutput>) {
    return !this.props.config.dependencies?.length;
  }

  getMountType() {
    return "CreateJob:JobConfigDisplay:App:Dependencies";
  }

  getDefinition() {
    return {
      tabViewID: "dependencies",
      values: [
        { heading: <Trans id="Dependencies" />, headingLevel: 1 },
        {
          key: "dependencies",
          render: (deps: Array<{ id: string }>) => (
            <BorderedList tag="ul">
              {deps.map(({ id }) => (
                <li key={id}>
                  <Link to={`/jobs/detail/${id}`}>{id}</Link>
                </li>
              ))}
            </BorderedList>
          ),
        },
      ],
    };
  }
}
