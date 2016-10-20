import {DCOSStore} from 'foundation-ui';
import React from 'react';

import Loader from '../../../../../../src/js/components/Loader';
import Service from '../../structs/Service';
import ServiceConfiguration from './ServiceConfiguration';

class ServiceConfigurationContainer extends React.Component {

  componentWillMount() {
    let {service} = this.props;

    DCOSStore.fetchServiceVersions(service.getId());
  }

  componentWillReceiveProps({service:nextService}) {
    let {service} = this.props;

    if (service.getVersion() !== nextService.getVersion()) {
      DCOSStore.fetchServiceVersions(nextService.getId());
    }
  }

  render() {
    let {actions, service} = this.props;

    // Wait till we've loaded the versions
    if (!service.getVersions().size) {
      return <Loader />;
    }

    return (
      <ServiceConfiguration
        editService={actions.editService}
        service={service} />
    );
  }
}

ServiceConfigurationContainer.propTypes = {
  actions: React.PropTypes.shape({
    editService: React.PropTypes.func.isRequired
  }).isRequired,
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceConfigurationContainer;
