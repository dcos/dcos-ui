import React from 'react';
import {MountService} from 'foundation-ui';

import ConfigurationMap from '../../../../../src/js/components/ConfigurationMap';
import ServiceConfigGeneralSectionDisplay from './ServiceConfigGeneralSectionDisplay';
import ServiceConfigNetworkingSectionDisplay from './ServiceConfigNetworkingSectionDisplay';
import ServiceConfigStorageSectionDisplay from './ServiceConfigStorageSectionDisplay';
import ServiceConfigEnvironmentVariablesSectionDisplay from './ServiceConfigEnvironmentVariablesSectionDisplay';
import ServiceConfigLabelsSectionDisplay from './ServiceConfigLabelsSectionDisplay';
import ServiceConfigHealthChecksSectionDisplay from './ServiceConfigHealthChecksSectionDisplay';

// To pad priorities, so we can add components in between
const PRIORITIES_PAD_NUMBER = 100;

const SERVICE_CONFIG_DISPLAY_LIST = [
  ServiceConfigGeneralSectionDisplay,
  ServiceConfigNetworkingSectionDisplay,
  ServiceConfigStorageSectionDisplay,
  ServiceConfigEnvironmentVariablesSectionDisplay,
  ServiceConfigLabelsSectionDisplay,
  ServiceConfigHealthChecksSectionDisplay
].reverse(); // MountService sorts by priority but DESC ¯\_(ツ)_/¯

class ServiceConfigDisplay extends React.Component {
  componentWillMount() {
    SERVICE_CONFIG_DISPLAY_LIST.forEach((component, index) => {
      MountService.MountService.registerComponent(
        component,
        'CreateService:ServiceConfigDisplay',
        PRIORITIES_PAD_NUMBER * index
      );
    });
  }

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
