import {DCOSStore} from 'foundation-ui';
import React from 'react';

import Loader from '../../../../../../src/js/components/Loader';
import Service from '../../structs/Service';
import ServiceConfiguration from './ServiceConfiguration';

class ServiceConfigurationContainer extends React.Component {

  componentWillMount() {
    const {service} = this.props;

    DCOSStore.fetchServiceVersions(service.getId());
  }

  componentWillReceiveProps({service:nextService}) {
    const {service} = this.props;

    if (service.getVersion() !== nextService.getVersion()) {
      DCOSStore.fetchServiceVersions(nextService.getId());
    }
  }

  render() {
    const {onEditClick, service} = this.props;

    // Wait till we've loaded the versions
    if (!service.getVersions().size) {
      return <Loader />;
    }

    return (
      <ServiceConfiguration
        onEditClick={onEditClick}
        service={service} />
    );
  }
}

ServiceConfigurationContainer.propTypes = {
  onEditClick: React.PropTypes.func.isRequired,
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceConfigurationContainer;
