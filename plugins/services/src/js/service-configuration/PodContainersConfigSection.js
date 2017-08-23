/* @flow */
import React from "react";

import Alert from "#SRC/js/components/Alert";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
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

type Props = { onEditClick?: Function };

const PodContainersConfigSection = (props: Props) => {
  const { appConfig, onEditClick } = props;
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

module.exports = PodContainersConfigSection;
