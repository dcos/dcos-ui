import React from 'react';

import ConfigurationMap from '../../../../../src/js/components/ConfigurationMap';
import PodContainersConfigSection from './PodContainersConfigSection';
import PodEnvironmentVariablesConfigSection from './PodEnvironmentVariablesConfigSection';
import PodGeneralConfigSection from './PodGeneralConfigSection';
import PodHealthChecksConfigSection from './PodHealthChecksConfigSection';
import PodLabelsConfigSection from './PodLabelsConfigSection';
import PodNetworkConfigSection from './PodNetworkConfigSection';
import PodPlacementConstraintsConfigSection from './PodPlacementConstraintsConfigSection';
import PodStorageConfigSection from './PodStorageConfigSection';

module.exports = ({appConfig}) => {
  return (
    <div className="flex-item-grow-1">
      <div className="container">
        <ConfigurationMap>
          <PodGeneralConfigSection appConfig={appConfig} />
          <PodPlacementConstraintsConfigSection appConfig={appConfig} />
          <PodContainersConfigSection appConfig={appConfig} />
          <PodNetworkConfigSection appConfig={appConfig} />
          <PodStorageConfigSection appConfig={appConfig} />
          <PodEnvironmentVariablesConfigSection appConfig={appConfig} />
          <PodLabelsConfigSection appConfig={appConfig} />
          <PodHealthChecksConfigSection appConfig={appConfig} />
        </ConfigurationMap>
      </div>
    </div>
  );
};
