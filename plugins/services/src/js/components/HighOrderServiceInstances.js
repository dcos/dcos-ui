import React from "react";

import Pod from "../structs/Pod";
import PodInstancesContainer
  from "../containers/pod-instances/PodInstancesContainer";
import Service from "../structs/Service";
import ServiceInstancesContainer
  from "../containers/service-instances/ServiceInstancesContainer";

const HighOrderServiceInstances = function(props) {
  const { pod, service, params } = props;
  if (pod != null) {
    return <PodInstancesContainer pod={pod} />;
  }

  return <ServiceInstancesContainer service={service} params={params} />;
};

HighOrderServiceInstances.propTypes = {
  params: React.PropTypes.object.isRequired,
  pod: React.PropTypes.instanceOf(Pod),
  service: React.PropTypes.instanceOf(Service)
};

module.exports = HighOrderServiceInstances;
