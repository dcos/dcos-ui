import React from 'react';
import {MountService} from 'foundation-ui';

import Alert from '../../../../../src/js/components/Alert';
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
  componentWillUnmount() {
    this.props.clearError();
  }

  getMountType() {
    if (this.props.appConfig instanceof PodSpec) {
      return 'CreateService:ServiceConfigDisplay:Pod';
    }

    return 'CreateService:ServiceConfigDisplay:App';
  }

  getRootErrors() {
    if (this.props.errors.size !== 0 && this.props.errors.has('/')) {
      const messages = this.props.errors.get('/').map((message, index) => {
        return <div key={index}>{message}</div>;
      });

      return <Alert>{messages}</Alert>;
    }
  }

  render() {
    const {appConfig, errors, handleEditClick} = this.props;

    return (
      <ConfigurationMap>
        {this.getRootErrors()}
        <MountService.Mount
          appConfig={appConfig}
          errors={errors}
          handleEditClick={handleEditClick}
          type={this.getMountType()} />
      </ConfigurationMap>
    );
  };
}

ServiceConfigDisplay.defaultProps = {
  clearError() {},
  errors: new Map()
};

ServiceConfigDisplay.propTypes = {
  appConfig: React.PropTypes.object.isRequired,
  clearError: React.PropTypes.func,
  errors: React.PropTypes.object,
  handleEditClick: React.PropTypes.func
};

module.exports = ServiceConfigDisplay;
