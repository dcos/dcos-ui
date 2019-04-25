import * as React from "react";
import { Trans } from "@lingui/macro";

import BaseConfig, { Value } from "#SRC/js/components/BaseConfig";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { getDisplayValue } from "#SRC/js/utils/ConfigDisplayUtil";

import { JobOutput } from "../form/helpers/JobFormData";

class GeneralConfigSection extends BaseConfig<JobOutput> {
  shouldExcludeItem(row: Value<JobOutput>) {
    const { config } = this.props;
    switch (row.key) {
      case "containerImage":
        return !(config.job.run.ucr || config.job.run.docker);
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
          key: "job.id",
          label: <Trans>Job ID</Trans>
        },
        {
          key: "job.description",
          label: <Trans>Description</Trans>
        },
        {
          key: "job.run.cpus",
          label: <Trans>CPU</Trans>
        },
        {
          key: "job.run.mem",
          label: <Trans>Mem</Trans>
        },
        {
          key: "job.run.disk",
          label: <Trans>Disk</Trans>
        },
        {
          key: "job.run.gpus",
          label: <Trans>GPU</Trans>
        },
        {
          key: "job.run.cmd",
          label: <Trans>Command</Trans>
        },
        {
          key: "containerImage",
          label: <Trans>Container Image</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { ucr, docker } = config.job.run;
            if (ucr) {
              return getDisplayValue(ucr.image && ucr.image.id);
            }
            if (docker) {
              return getDisplayValue(docker.image);
            }
            return getDisplayValue("");
          }
        }
      ]
    };
  }
}

export default GeneralConfigSection;
