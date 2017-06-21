import React from "react";

import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ConfigurationMapBooleanValue
  from "../components/ConfigurationMapBooleanValue";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel
  from "../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapMultilineValue
  from "../components/ConfigurationMapMultilineValue";
import ConfigurationMapRow
  from "../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../src/js/components/ConfigurationMapSection";
import ConfigurationMapSizeValue from "../components/ConfigurationMapSizeValue";
import ConfigurationMapValue
  from "../../../../../src/js/components/ConfigurationMapValue";
import ConfigurationMapValueWithDefault
  from "../components/ConfigurationMapValueWithDefault";
import PodContainerArtifactsConfigSection
  from "./PodContainerArtifactsConfigSection";
import { findNestedPropertyInObject } from "../../../../../src/js/utils/Util";
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

  return (
    <ConfigurationMapSection key="pod-general-section">

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
        <ConfigurationMapEditAction
          onEditClick={onEditClick}
          tabViewID={tabViewID}
        />
      </ConfigurationMapRow>
      <ConfigurationMapRow>
        <ConfigurationMapLabel>Force pull on launch</ConfigurationMapLabel>
        <ConfigurationMapBooleanValue
          value={findNestedPropertyInObject(containerConfig, "image.forcePull")}
        />
        <ConfigurationMapEditAction
          onEditClick={onEditClick}
          tabViewID={tabViewID}
        />
      </ConfigurationMapRow>

      {/* Resources */}
      {Boolean(fields.resources.cpus) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.cpus} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID={tabViewID}
          />
        </ConfigurationMapRow>}
      {Boolean(fields.resources.mem) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.mem} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID={tabViewID}
          />
        </ConfigurationMapRow>}
      {Boolean(fields.resources.disk) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.disk} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID={tabViewID}
          />
        </ConfigurationMapRow>}
      {Boolean(fields.resources.gpus) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>GPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.gpus} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID={tabViewID}
          />
        </ConfigurationMapRow>}

      {/* Global Properties */}
      {Boolean(fields.user) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Run as User</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.user} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID={tabViewID}
          />
        </ConfigurationMapRow>}
      {Boolean(fields.command) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Command</ConfigurationMapLabel>
          <ConfigurationMapMultilineValue value={fields.command} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID={tabViewID}
          />
        </ConfigurationMapRow>}

      {/* Container artifacts */}
      <PodContainerArtifactsConfigSection
        artifacts={containerConfig.artifacts}
        onEditClick={onEditClick}
        index={index}
      />

    </ConfigurationMapSection>
  );
};

PodContainerConfigSection.propTypes = {
  index: React.PropTypes.number,
  onEditClick: React.PropTypes.func
};

module.exports = PodContainerConfigSection;
