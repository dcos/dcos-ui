import React from "react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

import ConfigurationMapAction from "../components/ConfigurationMapAction";
import ConfigurationMapBooleanValue
  from "../components/ConfigurationMapBooleanValue";
import ConfigurationMapMultilineValue
  from "../components/ConfigurationMapMultilineValue";
import ConfigurationMapSizeValue from "../components/ConfigurationMapSizeValue";
import ConfigurationMapValueWithDefault
  from "../components/ConfigurationMapValueWithDefault";
import PodContainerArtifactsConfigSection
  from "./PodContainerArtifactsConfigSection";
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
        <ConfigurationMapAction
          onClick={onEditClick.bind(this, tabViewID)}
          isHover={true}
        >
          Edit
        </ConfigurationMapAction>
      </ConfigurationMapRow>
      <ConfigurationMapRow>
        <ConfigurationMapLabel>Force pull on launch</ConfigurationMapLabel>
        <ConfigurationMapBooleanValue
          value={findNestedPropertyInObject(containerConfig, "image.forcePull")}
        />
        <ConfigurationMapAction
          onClick={onEditClick.bind(this, tabViewID)}
          isHover={true}
        >
          Edit
        </ConfigurationMapAction>
      </ConfigurationMapRow>

      {/* Resources */}
      {Boolean(fields.resources.cpus) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.cpus} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, tabViewID)}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>}
      {Boolean(fields.resources.mem) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.mem} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, tabViewID)}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>}
      {Boolean(fields.resources.disk) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.disk} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, tabViewID)}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>}
      {Boolean(fields.resources.gpus) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>GPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.gpus} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, tabViewID)}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>}

      {/* Global Properties */}
      {Boolean(fields.user) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Run as User</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.user} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, tabViewID)}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>}
      {Boolean(fields.command) &&
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Command</ConfigurationMapLabel>
          <ConfigurationMapMultilineValue value={fields.command} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, tabViewID)}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
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
