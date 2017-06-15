import React from "react";
import { MountService } from "foundation-ui";

import ErrorsAlert from "../../../../../src/js/components/ErrorsAlert";
import ConfigurationMap
  from "../../../../../src/js/components/ConfigurationMap";
import {
  translateErrorMessages
} from "../../../../../src/js/utils/ErrorMessageUtil";
import PodContainersConfigSection from "./PodContainersConfigSection";
import PodEnvironmentVariablesConfigSection
  from "./PodEnvironmentVariablesConfigSection";
import PodGeneralConfigSection from "./PodGeneralConfigSection";
import PodHealthChecksConfigSection from "./PodHealthChecksConfigSection";
import PodLabelsConfigSection from "./PodLabelsConfigSection";
import PodNetworkConfigSection from "./PodNetworkConfigSection";
import PodPlacementConstraintsConfigSection
  from "./PodPlacementConstraintsConfigSection";
import PodSpec from "../structs/PodSpec";
import PodStorageConfigSection from "./PodStorageConfigSection";
import ServiceEnvironmentVariablesConfigSection
  from "./ServiceEnvironmentVariablesConfigSection";
import ServiceErrorMessages from "../constants/ServiceErrorMessages";
import ServiceErrorPathMapping from "../constants/ServiceErrorPathMapping";
import ServiceGeneralConfigSection from "./ServiceGeneralConfigSection";
import ServiceHealthChecksConfigSection
  from "./ServiceHealthChecksConfigSection";
import ServiceLabelsConfigSection from "./ServiceLabelsConfigSection";
import ServiceNetworkingConfigSection from "./ServiceNetworkingConfigSection";
import ServicePlacementConstraintsConfigSection
  from "./ServicePlacementConstraintsConfigSection";
import ServiceStorageConfigSection from "./ServiceStorageConfigSection";

const PRIORITIES_PAD_NUMBER = 100;
const DEFAULT_DISPLAY_COMPONENTS = [
  {
    MOUNT_TYPE: "CreateService:ServiceConfigDisplay:App",
    COMPONENTS: [
      ServiceGeneralConfigSection,
      ServicePlacementConstraintsConfigSection,
      ServiceNetworkingConfigSection,
      ServiceStorageConfigSection,
      ServiceEnvironmentVariablesConfigSection,
      ServiceLabelsConfigSection,
      ServiceHealthChecksConfigSection
    ]
  },
  {
    MOUNT_TYPE: "CreateService:ServiceConfigDisplay:Pod",
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
DEFAULT_DISPLAY_COMPONENTS.forEach(({ MOUNT_TYPE, COMPONENTS }) => {
  COMPONENTS.forEach((component, index, componentArray) => {
    // Define  component priorities based on index (highest prio goes first)
    // and pad priorities, so that we can add components in between.
    const priority = (componentArray.length - index) * PRIORITIES_PAD_NUMBER;
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
      return "CreateService:ServiceConfigDisplay:Pod";
    }

    return "CreateService:ServiceConfigDisplay:App";
  }

  getErrors() {
    return translateErrorMessages(this.props.errors, ServiceErrorMessages);
  }

  render() {
    const { appConfig, onEditClick } = this.props;
    const errorsAlert = (
      <ErrorsAlert
        errors={this.getErrors()}
        pathMapping={ServiceErrorPathMapping}
      />
    );

    return (
      <ConfigurationMap>
        {errorsAlert}
        <MountService.Mount
          appConfig={appConfig}
          errors={errorsAlert}
          onEditClick={onEditClick}
          type={this.getMountType()}
        />
      </ConfigurationMap>
    );
  }
}

ServiceConfigDisplay.defaultProps = {
  errors: []
};

ServiceConfigDisplay.propTypes = {
  appConfig: React.PropTypes.object.isRequired,
  errors: React.PropTypes.array,
  onEditClick: React.PropTypes.func
};

module.exports = ServiceConfigDisplay;
