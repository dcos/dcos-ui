import PropTypes from "prop-types";
import React from "react";

import Pod from "../structs/Pod";
import PodConfigurationContainer
  from "../containers/pod-configuration/PodConfigurationContainer";
import Service from "../structs/Service";
import ServiceConfigurationContainer
  from "../containers/service-configuration/ServiceConfigurationContainer";
import FrameworkConfigurationContainer
  from "../containers/framework-configuration/FrameworkConfigurationContainer";

const HighOrderServiceConfiguration = function(props) {
  const { errors, onEditClick, service } = props;
  if (service instanceof Pod) {
    return <PodConfigurationContainer pod={service} />;
  }

  if (
    service.getLabels().DCOS_PACKAGE_DEFINITION != null ||
    service.getLabels().DCOS_PACKAGE_METADATA != null
  ) {
    return <FrameworkConfigurationContainer service={service} />;
  }

  return (
    <ServiceConfigurationContainer
      errors={errors}
      onEditClick={onEditClick}
      service={service}
    />
  );
};

HighOrderServiceConfiguration.propTypes = {
  errors: PropTypes.array,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(Pod),
    PropTypes.instanceOf(Service)
  ])
};

module.exports = HighOrderServiceConfiguration;
