import React from 'react';

import ConfigurationView from './ConfigurationView';
import Service from '../structs/Service';

class ServiceDetailConfigurationTab extends React.Component {

  render() {
    let {service} = this.props;
    let {currentVersionID} = service.getVersionInfo();

    return (
      <ConfigurationView
        headline={`Current Version (${currentVersionID})`}
        service={service}
        versionID={currentVersionID} />
    );
  }

}

ServiceDetailConfigurationTab.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceDetailConfigurationTab;
