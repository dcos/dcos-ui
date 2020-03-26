import * as React from "react";
import { Trans } from "@lingui/macro";

import BaseConfig, { Value } from "#SRC/js/components/BaseConfig";
import { getDisplayValue } from "#SRC/js/utils/ConfigDisplayUtil";

import { JobOutput } from "../form/helpers/JobFormData";

class ContainerConfigSection extends BaseConfig<JobOutput> {
  public shouldExcludeItem(row: Value<JobOutput>) {
    const { config } = this.props;
    if (row.key === "kind" && !config.run.ucr) {
      return true;
    }
    if (
      row.key === "parameters" &&
      (!config.run.docker ||
        !config.run.docker.parameters ||
        !config.run.docker.parameters.length)
    ) {
      return true;
    }
    return !config.run.ucr && !config.run.docker;
  }

  public getMountType() {
    return "CreateJob:JobConfigDisplay:App:Container";
  }

  public getDefinition() {
    return {
      tabViewID: "jobs",
      values: [
        {
          heading: <Trans>Container</Trans>,
          headingLevel: 1,
        },
        {
          key: "type",
          label: <Trans>Type</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { ucr, docker } = config.run;
            if (ucr) {
              return "UCR";
            }
            if (docker) {
              return "Docker";
            }
            return getDisplayValue("");
          },
        },
        {
          key: "containerImage",
          label: <Trans>Container Image</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { ucr, docker } = config.run;
            if (ucr) {
              return getDisplayValue(ucr.image && ucr.image.id);
            }
            if (docker) {
              return getDisplayValue(docker.image);
            }
            return getDisplayValue("");
          },
        },
        {
          key: "kind",
          label: <Trans>Image Kind</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { ucr } = config.run;
            if (ucr) {
              return getDisplayValue(ucr.image && ucr.image.kind);
            }
            return getDisplayValue("");
          },
        },
        {
          key: "forcePull",
          label: <Trans>Force Pull</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { ucr, docker } = config.run;
            if (ucr) {
              return `${
                ucr.image && ucr.image.forcePull != null
                  ? ucr.image.forcePull
                  : ""
              }`;
            }
            if (docker) {
              return `${
                docker.forcePullImage != null ? docker.forcePullImage : ""
              }`;
            }
            return getDisplayValue("");
          },
        },
        {
          key: "privileged",
          label: <Trans>Privileged</Trans>,
          transformValue(_: any, config: JobOutput) {
            const { ucr, docker } = config.run;
            if (ucr) {
              return `${ucr.privileged != null ? ucr.privileged : ""}`;
            }
            if (docker) {
              return `${docker.privileged != null ? docker.privileged : ""}`;
            }
            return getDisplayValue("");
          },
        },
      ],
    };
  }
}

export default ContainerConfigSection;
