import React from 'react';

import Alert from '../../../../../src/js/components/Alert';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import PodContainerConfigSection from './PodContainerConfigSection';

function renderContainers(appConfig, handleEditClick, tabViewID) {
  let {containers = []} = appConfig;

  return containers.map((container) => {
    return (
      <PodContainerConfigSection
        appConfig={appConfig}
        containerConfig={container}
        key={`pod-container-${container.name}`}
        onEditClick={handleEditClick}
        tabViewID={tabViewID} />
    );
  });
}

module.exports = ({appConfig, onEditClick, tabViewID}) => {
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
      {renderContainers(appConfig, onEditClick, tabViewID)}
    </div>
  );
};
