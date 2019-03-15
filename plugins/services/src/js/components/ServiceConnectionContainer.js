import PropTypes from "prop-types";
import React from "react";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import Service from "../structs/Service";
import Pod from "../structs/Pod";
import ServiceConnectionEndpointList from "../containers/service-connection/ServiceConnectionEndpointList";
import ServicePodConnectionEndpointList from "../containers/service-connection/ServicePodConnectionEndpointList";
import SDKServiceConnectionEndpointList from "../containers/service-connection/SDKServiceConnectionEndpointList";

const ServiceConnectionContainer = function(props) {
  const { service } = props;
  if (isSDKService(service)) {
    return <SDKServiceConnectionEndpointList service={service} />;
  }

  if (service instanceof Pod) {
    return <ServicePodConnectionEndpointList service={service} />;
  }

  return <ServiceConnectionEndpointList service={service} />;
};

ServiceConnectionContainer.propTypes = {
  service: PropTypes.instanceOf(Service)
};

export default ServiceConnectionContainer;
