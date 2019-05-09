import * as React from "react";
import { Trans } from "@lingui/macro";

import BaseConfig, { Value } from "#SRC/js/components/BaseConfig";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import { JobOutput } from "../form/helpers/JobFormData";

class GeneralConfigSection extends BaseConfig<JobOutput> {
  shouldExcludeItem(row: Value<JobOutput>) {
    const { config } = this.props;
    switch (row.key) {
      case "containerImage":
        return !(config.run.ucr || config.run.docker);
      case undefined:
        return false;
      default:
        const prop = findNestedPropertyInObject(config, row.key);
        return !(prop != null && prop !== "");
    }
  }

  getMountType() {
    return "CreateJob:JobConfigDisplay:App:General";
  }

  getDefinition() {
    return {
      tabViewID: "jobs",
      values: [
        {
          heading: <Trans>General</Trans>,
          headingLevel: 1
        },
        {
          key: "id",
          label: <Trans>Job ID</Trans>
        },
        {
          key: "description",
          label: <Trans>Description</Trans>
        },
        {
          key: "run.cpus",
          label: <Trans>CPU</Trans>
        },
        {
          key: "run.mem",
          label: <Trans>Mem</Trans>
        },
        {
          key: "run.disk",
          label: <Trans>Disk</Trans>
        },
        {
          key: "run.gpus",
          label: <Trans>GPU</Trans>
        },
        {
          key: "run.cmd",
          label: <Trans>Command</Trans>
        }
      ]
    };
  }
}

export default GeneralConfigSection;
