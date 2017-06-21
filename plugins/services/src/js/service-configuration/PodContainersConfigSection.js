import React from "react";

import Alert from "../../../../../src/js/components/Alert";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import PodContainerConfigSection from "./PodContainerConfigSection";

function renderContainers(appConfig, handleEditClick) {
  const { containers = [] } = appConfig;

  return containers.map((container, index) => {
    return (
      <PodContainerConfigSection
        appConfig={appConfig}
        containerConfig={container}
        key={`pod-container-${container.name}`}
        onEditClick={handleEditClick}
        index={index}
      />
    );
  });
}

const PodContainersConfigSection = ({ appConfig, onEditClick }) => {
  if (!appConfig.containers || !appConfig.containers.length) {
    return (
      <div>
        <ConfigurationMapHeading level={2}>Containers</ConfigurationMapHeading>
        <Alert>
          No containers specified! Please specify at least one container when
          creating a multi-container definition!
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <ConfigurationMapHeading level={2}>Containers</ConfigurationMapHeading>
      {renderContainers(appConfig, onEditClick)}
    </div>
  );
};

PodContainersConfigSection.propTypes = {
  onEditClick: React.PropTypes.func
};

module.exports = PodContainersConfigSection;
