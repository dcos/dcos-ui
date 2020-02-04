import PropTypes from "prop-types";
import * as React from "react";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import Loader from "#SRC/js/components/Loader";

import Service from "../../structs/Service";
import ServiceConfiguration from "./ServiceConfiguration";

export default class ServiceConfigurationContainer extends React.Component {
  static defaultProps = {
    errors: []
  };
  static propTypes = {
    onEditClick: PropTypes.func,
    errors: PropTypes.array,
    service: PropTypes.instanceOf(Service)
  };
  UNSAFE_componentWillMount() {
    const { service } = this.props;

    DCOSStore.fetchServiceVersions(service.getId());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
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
