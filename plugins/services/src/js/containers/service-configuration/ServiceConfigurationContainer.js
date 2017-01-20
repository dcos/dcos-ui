import {DCOSStore} from 'foundation-ui';
import React from 'react';
import {routerShape} from 'react-router';

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
    const {service} = this.props;

    // Wait till we've loaded the versions
    if (!service.getVersions().size) {
      return <Loader />;
    }

    const editService = () => {
      this.context.router.push(
        `/services/overview/${encodeURIComponent(service.getId())}/edit`
      );
    };

    return (
      <ServiceConfiguration
        editService={editService}
        service={service} />
    );
  }
}

ServiceConfigurationContainer.contextTypes = {
  router: routerShape
};

ServiceConfigurationContainer.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceConfigurationContainer;
