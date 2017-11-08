import React from "react";

import Framework from "#PLUGINS/services/src/js/structs/Framework";
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

  if (service instanceof Framework) {
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
  errors: React.PropTypes.array,
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Pod),
    React.PropTypes.instanceOf(Service)
  ])
};

module.exports = HighOrderServiceConfiguration;
