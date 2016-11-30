import React from 'react';
import {MountService} from 'foundation-ui';

import ConfigurationMap from '../../../../../src/js/components/ConfigurationMap';
import PodContainersConfigSection from '../service-configuration/PodContainersConfigSection';
import PodEnvironmentVariablesConfigSection from '../service-configuration/PodEnvironmentVariablesConfigSection';
import PodGeneralConfigSection from '../service-configuration/PodGeneralConfigSection';
import PodHealthChecksConfigSection from '../service-configuration/PodHealthChecksConfigSection';
import PodLabelsConfigSection from '../service-configuration/PodLabelsConfigSection';
import PodNetworkConfigSection from '../service-configuration/PodNetworkConfigSection';
import PodPlacementConstraintsConfigSection from '../service-configuration/PodPlacementConstraintsConfigSection';
import PodSpec from '../structs/PodSpec';
import PodStorageConfigSection from '../service-configuration/PodStorageConfigSection';
import ServiceConfigEnvironmentVariablesSectionDisplay from './ServiceConfigEnvironmentVariablesSectionDisplay';
import ServiceConfigGeneralSectionDisplay from './ServiceConfigGeneralSectionDisplay';
import ServiceConfigHealthChecksSectionDisplay from './ServiceConfigHealthChecksSectionDisplay';
import ServiceConfigLabelsSectionDisplay from './ServiceConfigLabelsSectionDisplay';
import ServiceConfigNetworkingSectionDisplay from './ServiceConfigNetworkingSectionDisplay';
import ServiceConfigPlacementConstraintsSectionDisplay from './ServiceConfigPlacementConstraintsSectionDisplay';
import ServiceConfigStorageSectionDisplay from './ServiceConfigStorageSectionDisplay';

const PRIORITIES_PAD_NUMBER = 100;
const DEFAULT_DISPLAY_COMPONENTS = [
  {
    MOUNT_TYPE: 'CreateService:ServiceConfigDisplay:App',
    COMPONENTS: [
      ServiceConfigGeneralSectionDisplay,
      ServiceConfigPlacementConstraintsSectionDisplay,
      ServiceConfigNetworkingSectionDisplay,
      ServiceConfigStorageSectionDisplay,
      ServiceConfigEnvironmentVariablesSectionDisplay,
      ServiceConfigLabelsSectionDisplay,
      ServiceConfigHealthChecksSectionDisplay
    ]
  },
  {
    MOUNT_TYPE: 'CreateService:ServiceConfigDisplay:Pod',
    COMPONENTS: [
      PodGeneralConfigSection,
      PodContainersConfigSection,
      PodPlacementConstraintsConfigSection,
      PodNetworkConfigSection,
      PodStorageConfigSection,
      PodEnvironmentVariablesConfigSection,
      PodLabelsConfigSection,
      PodHealthChecksConfigSection
    ]
  }
];

// Register default config display components (this needs to only happen once)
DEFAULT_DISPLAY_COMPONENTS.forEach(({MOUNT_TYPE, COMPONENTS}) => {
  COMPONENTS.forEach((component, index, componentArray) => {
    // Define  component priorities based on index (highest prio goes first)
    // and pad priorities, so that we can add components in between.
    let priority = (componentArray.length - index) * PRIORITIES_PAD_NUMBER;
    MountService.MountService.registerComponent(
        component,
        MOUNT_TYPE,
        priority
    );
  });
});

class ServiceConfigDisplay extends React.Component {
  getMountType() {
    if (this.props.appConfig instanceof PodSpec) {
      return 'CreateService:ServiceConfigDisplay:Pod';
    }

    return 'CreateService:ServiceConfigDisplay:App';
  }

  render() {
    return (
      <div className="flex-item-grow-1">
        <div className="container">
          <ConfigurationMap>
            <MountService.Mount
              type={this.getMountType()}
              appConfig={this.props.appConfig} />
          </ConfigurationMap>
        </div>
      </div>
    );
  };
}

ServiceConfigDisplay.propTypes = {
  appConfig: React.PropTypes.object.isRequired
};

module.exports = ServiceConfigDisplay;
