import React from 'react';
import {MountService} from 'foundation-ui';

import ConfigurationMap from '../../../../../src/js/components/ConfigurationMap';
import ServiceConfigGeneralSectionDisplay from './ServiceConfigGeneralSectionDisplay';
import ServiceConfigPlacementConstraintsSectionDisplay from './ServiceConfigPlacementConstraintsSectionDisplay';
import ServiceConfigNetworkingSectionDisplay from './ServiceConfigNetworkingSectionDisplay';
import ServiceConfigStorageSectionDisplay from './ServiceConfigStorageSectionDisplay';
import ServiceConfigEnvironmentVariablesSectionDisplay from './ServiceConfigEnvironmentVariablesSectionDisplay';
import ServiceConfigLabelsSectionDisplay from './ServiceConfigLabelsSectionDisplay';
import ServiceConfigHealthChecksSectionDisplay from './ServiceConfigHealthChecksSectionDisplay';

const MOUNT_TYPE = 'CreateService:ServiceConfigDisplay';
const PRIORITIES_PAD_NUMBER = 100;
const DEFAULT_DISPLAY_COMPONENTS = [
  ServiceConfigGeneralSectionDisplay,
  ServiceConfigPlacementConstraintsSectionDisplay,
  ServiceConfigNetworkingSectionDisplay,
  ServiceConfigStorageSectionDisplay,
  ServiceConfigEnvironmentVariablesSectionDisplay,
  ServiceConfigLabelsSectionDisplay,
  ServiceConfigHealthChecksSectionDisplay
];

// Register default config display components (this needs to only happen once)
DEFAULT_DISPLAY_COMPONENTS.forEach((component, index, componentArray) => {
  // Define  component priorities based on index (highest prio goes first)
  // and pad priorities, so that we can add components in between.
  let priority = (componentArray.length - index) * PRIORITIES_PAD_NUMBER;
  MountService.MountService.registerComponent(
      component,
      MOUNT_TYPE,
      priority
  );
});

class ServiceConfigDisplay extends React.Component {
  render() {
    return (
      <div className="flex-item-grow-1">
        <div className="container">
          <ConfigurationMap>
            <MountService.Mount
              type="CreateService:ServiceConfigDisplay"
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
