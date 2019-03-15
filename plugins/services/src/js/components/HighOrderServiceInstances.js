import PropTypes from "prop-types";
import React from "react";

import Pod from "../structs/Pod";
import PodInstancesContainer from "../containers/pod-instances/PodInstancesContainer";
import Service from "../structs/Service";
import ServiceInstancesContainer from "../containers/service-instances/ServiceInstancesContainer";

const HighOrderServiceInstances = function(props) {
  const { service, params, location } = props;
  if (service instanceof Pod) {
    return (
      <PodInstancesContainer
        location={location}
        params={params}
        pod={service}
      />
    );
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
  params: PropTypes.object.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(Pod),
    PropTypes.instanceOf(Service)
  ])
};

export default HighOrderServiceInstances;
