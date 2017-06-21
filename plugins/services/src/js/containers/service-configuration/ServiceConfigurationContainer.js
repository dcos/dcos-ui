import { DCOSStore } from "foundation-ui";
import React from "react";

import Loader from "../../../../../../src/js/components/Loader";
import Service from "../../structs/Service";
import ServiceConfiguration from "./ServiceConfiguration";

class ServiceConfigurationContainer extends React.Component {
  componentWillMount() {
    const { service } = this.props;

    DCOSStore.fetchServiceVersions(service.getId());
  }

  componentWillReceiveProps(nextProps) {
    const { service: nextService } = nextProps;
    const { service } = this.props;

    if (service.getVersion() !== nextService.getVersion()) {
      DCOSStore.fetchServiceVersions(nextService.getId());
    }
  }

  render() {
    const { errors, onEditClick, service } = this.props;

    // Wait till we've loaded the versions
    if (!service.getVersions().size) {
      return <Loader />;
    }

    return (
      <ServiceConfiguration
        errors={errors}
        onEditClick={onEditClick}
        service={service}
      />
    );
  }
}

ServiceConfigurationContainer.defaultProps = {
  errors: []
};

ServiceConfigurationContainer.propTypes = {
  onEditClick: React.PropTypes.func,
  errors: React.PropTypes.array,
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceConfigurationContainer;
