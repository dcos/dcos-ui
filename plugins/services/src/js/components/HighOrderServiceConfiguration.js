/* @flow */
import React from "react";

import Pod from "../structs/Pod";
import PodConfigurationContainer
  from "../containers/pod-configuration/PodConfigurationContainer";
import Service from "../structs/Service";
import ServiceConfigurationContainer
  from "../containers/service-configuration/ServiceConfigurationContainer";

type Props = {
  errors?: Array<any>,
  service?: Pod | Service,
};

const HighOrderServiceConfiguration = function(props: Props) {
  const { errors, onEditClick, service } = props;
  if (service instanceof Pod) {
    return <PodConfigurationContainer pod={service} />;
  }

  return (
    <ServiceConfigurationContainer
      errors={errors}
      onEditClick={onEditClick}
      service={service}
    />
  );
};

module.exports = HighOrderServiceConfiguration;
