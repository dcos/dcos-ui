import React from "react";

import Pod from "../structs/Pod";
import PodInstancesContainer
  from "../containers/pod-instances/PodInstancesContainer";
import Service from "../structs/Service";
import ServiceInstancesContainer
  from "../containers/service-instances/ServiceInstancesContainer";

const HighOrderServiceInstances = function(props) {
  const { service, params, location } = props;
  if (service instanceof Pod) {
    return <PodInstancesContainer pod={service} />;
  }

  return (
    <ServiceInstancesContainer
      service={service}
      params={params}
      location={location}
    />
  );
};

HighOrderServiceInstances.propTypes = {
  params: React.PropTypes.object.isRequired,
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Pod),
    React.PropTypes.instanceOf(Service)
  ])
};

module.exports = HighOrderServiceInstances;
