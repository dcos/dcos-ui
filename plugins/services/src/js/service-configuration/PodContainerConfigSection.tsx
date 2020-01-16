import PropTypes from "prop-types";
import * as React from "react";
import { MountService } from "foundation-ui";
import { Trans } from "@lingui/macro";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

import ConfigurationMapBooleanValue from "../components/ConfigurationMapBooleanValue";
import ConfigurationMapMultilineValue from "../components/ConfigurationMapMultilineValue";
import ConfigurationMapSizeValue from "../components/ConfigurationMapSizeValue";
import ConfigurationMapValueWithDefault from "../components/ConfigurationMapValueWithDefault";
import PodContainerArtifactsConfigSection from "./PodContainerArtifactsConfigSection";
import { getContainerNameWithIcon } from "../utils/ServiceConfigDisplayUtil";

function getCommand(containerConfig) {
  if (containerConfig.exec && containerConfig.exec.command) {
    if (containerConfig.exec.command.shell) {
      return containerConfig.exec.command.shell;
    }
    if (containerConfig.exec.command.argv) {
      return containerConfig.exec.command.argv.join(" ");
    }
  }

  return null;
}

const PodContainerConfigSection = ({
  containerConfig,
  appConfig,
  onEditClick,
  index
}) => {
  const fields = {
    command: getCommand(containerConfig),
    resources: containerConfig.resources || {},
    resourceLimits: containerConfig.resourceLimits || {},
    user: containerConfig.user || appConfig.user
  };

  let tabViewID = "services";
  if (index != null) {
    tabViewID = `container${index}`;
  }

  let action;
  if (onEditClick) {
    action = (
      <a
        className="button button-link flush table-display-on-row-hover"
        onClick={onEditClick.bind(null, { tabViewID })}
      >
        Edit
      </a>
    );
  }

  return (
    <ConfigurationMapSection key="pod-general-section">
      <MountService.Mount
        type="CreateService:ServiceConfigDisplay:Pod:Container:General"
        containerConfig={containerConfig}
        onEditClick={onEditClick}
      >
        {/* Heading with Icon */}
        <ConfigurationMapHeading level={3}>
          {getContainerNameWithIcon(containerConfig)}
        </ConfigurationMapHeading>
        {/* Resources */}
        <ConfigurationMapSection key="pod-general-section-resources">
          <ConfigurationMapHeading level={4}>
            <Trans id="Resources" />
          </ConfigurationMapHeading>
          {Boolean(fields.resources.cpus) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>CPUs</Trans>
              <ConfigurationMapValue value={fields.resources.cpus} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.resourceLimits.cpus) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>CPUs Limit</Trans>
              <ConfigurationMapValue value={fields.resourceLimits.cpus} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.resources.mem) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Memory</Trans>
              <ConfigurationMapSizeValue value={fields.resources.mem} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.resourceLimits.mem) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Memory Limit</Trans>
              {fields.resourceLimits.mem === "unlimited" ? (
                <ConfigurationMapValue value={fields.resourceLimits.mem} />
              ) : (
                <ConfigurationMapSizeValue value={fields.resourceLimits.mem} />
              )}
              {action}
            </ConfigurationMapRow>
          )}
        </ConfigurationMapSection>

        <ConfigurationMapSection key="pod-general-section-general">
          <ConfigurationMapHeading level={4}>
            <Trans id="General" />
          </ConfigurationMapHeading>
          <ConfigurationMapRow>
            <Trans render={<ConfigurationMapLabel />}>Container Image</Trans>
            <ConfigurationMapValueWithDefault
              value={findNestedPropertyInObject(containerConfig, "image.id")}
            />
            {action}
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <Trans render={<ConfigurationMapLabel />}>
              Force pull on launch
            </Trans>
            <ConfigurationMapBooleanValue
              value={findNestedPropertyInObject(
                containerConfig,
                "image.forcePull"
              )}
            />
            {action}
          </ConfigurationMapRow>

          {Boolean(fields.resources.disk) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Disk</Trans>
              <ConfigurationMapSizeValue value={fields.resources.disk} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.resources.gpus) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>GPUs</Trans>
              <ConfigurationMapValue value={fields.resources.gpus} />
              {action}
            </ConfigurationMapRow>
          )}

          {/* Global Properties */}
          {Boolean(fields.user) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Run as User</Trans>
              <ConfigurationMapValue value={fields.user} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.command) && (
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Command</Trans>
              <ConfigurationMapMultilineValue value={fields.command} />
              {action}
            </ConfigurationMapRow>
          )}

          {/* Container artifacts */}
          <PodContainerArtifactsConfigSection
            artifacts={containerConfig.artifacts}
            onEditClick={onEditClick}
            index={index}
          />
        </ConfigurationMapSection>
      </MountService.Mount>
    </ConfigurationMapSection>
  );
};

PodContainerConfigSection.propTypes = {
  index: PropTypes.number,
  onEditClick: PropTypes.func
};

export default PodContainerConfigSection;
