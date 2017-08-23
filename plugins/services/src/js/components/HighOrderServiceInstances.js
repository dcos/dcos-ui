/* @flow */
import React from "react";

import Pod from "../structs/Pod";
import PodInstancesContainer
  from "../containers/pod-instances/PodInstancesContainer";
import Service from "../structs/Service";
import ServiceInstancesContainer
  from "../containers/service-instances/ServiceInstancesContainer";

type Props = {
  params: Object,
  service?: Pod | Service,
};

const HighOrderServiceInstances = function(props: Props) {
  const { service, params } = props;
  if (service instanceof Pod) {
    return <PodInstancesContainer pod={service} />;
  }

  return <ServiceInstancesContainer service={service} params={params} />;
};

module.exports = HighOrderServiceInstances;
