import React from "react";

import Pod from "../structs/Pod";
import PodConfigurationContainer
  from "../containers/pod-configuration/PodConfigurationContainer";
import Service from "../structs/Service";
import ServiceConfigurationContainer
  from "../containers/service-configuration/ServiceConfigurationContainer";

const HighOrderServiceConfiguration = props => {
  const { pod, errors, onEditClick, service } = props;
  if (pod != null) {
    return <PodConfigurationContainer pod={pod} />;
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
  errors: React.PropTypes.object,
  pod: React.PropTypes.instanceOf(Pod),
  service: React.PropTypes.instanceOf(Service)
};

module.exports = HighOrderServiceConfiguration;
