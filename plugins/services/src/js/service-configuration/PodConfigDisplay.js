import React from 'react';

import ConfigurationMap from '../../../../../src/js/components/ConfigurationMap';
import PodGeneralConfigSection from './PodGeneralConfigSection';
import PodContainersConfigSection from './PodContainersConfigSection';
import PodPlacementConstraintsConfigSection from './PodPlacementConstraintsConfigSection';
import PodNetworkConfigSection from './PodNetworkConfigSection';
import PodStorageConfigSection from './PodStorageConfigSection';
import PodEnvironmentVariablesConfigSection from './PodEnvironmentVariablesConfigSection';
import PodLabelsConfigSection from './PodLabelsConfigSection';
import PodHealthChecksConfigSection from './PodHealthChecksConfigSection';

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
