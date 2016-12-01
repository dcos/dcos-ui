import React from 'react';

import Alert from '../../../../../src/js/components/Alert';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import PodContainerConfigSection from './PodContainerConfigSection';

function renderContainers(appConfig) {
  let {containers=[]} = appConfig;

  return containers.map((container) => {
    return (<PodContainerConfigSection
      appConfig={appConfig}
      containerConfig={container}
      key={`pod-container-${container.name}`}
      />);
  });
}

module.exports = ({appConfig}) => {
  if (!appConfig.containers || !appConfig.containers.length) {
    return (
      <div>
        <Heading level={2}>Containers</Heading>
        <Alert>
          No containers specified! Please specify at least one container when
          creating a multi-container definition!
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Heading level={2}>Containers</Heading>
      {renderContainers(appConfig)}
    </div>
  );
};
