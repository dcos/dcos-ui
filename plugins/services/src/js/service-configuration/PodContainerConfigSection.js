import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";

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
    } else if (containerConfig.exec.command.argv) {
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

        {/* Container image goes to top */}
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Container Image</ConfigurationMapLabel>
          <ConfigurationMapValueWithDefault
            value={findNestedPropertyInObject(containerConfig, "image.id")}
          />
          {action}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Force pull on launch</ConfigurationMapLabel>
          <ConfigurationMapBooleanValue
            value={findNestedPropertyInObject(
              containerConfig,
              "image.forcePull"
            )}
          />
          {action}
        </ConfigurationMapRow>

        {/* Resources */}
        {Boolean(fields.resources.cpus) && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>CPUs</ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.resources.cpus} />
            {action}
          </ConfigurationMapRow>
        )}
        {Boolean(fields.resources.mem) && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
            <ConfigurationMapSizeValue value={fields.resources.mem} />
            {action}
          </ConfigurationMapRow>
        )}
        {Boolean(fields.resources.disk) && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
            <ConfigurationMapSizeValue value={fields.resources.disk} />
            {action}
          </ConfigurationMapRow>
        )}
        {Boolean(fields.resources.gpus) && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>GPUs</ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.resources.gpus} />
            {action}
          </ConfigurationMapRow>
        )}

        {/* Global Properties */}
        {Boolean(fields.user) && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Run as User</ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.user} />
            {action}
          </ConfigurationMapRow>
        )}
        {Boolean(fields.command) && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Command</ConfigurationMapLabel>
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
      </MountService.Mount>
    </ConfigurationMapSection>
  );
};

PodContainerConfigSection.propTypes = {
  index: PropTypes.number,
  onEditClick: PropTypes.func
};

module.exports = PodContainerConfigSection;
