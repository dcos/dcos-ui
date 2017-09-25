import React from "react";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import Service from "../structs/Service";
import Pod from "../structs/Pod";
import ServiceConnectionEndpointList
  from "../containers/service-connection/ServiceConnectionEndpointList";
import SDKServiceConnectionEndpointList
  from "../containers/service-connection/SDKServiceConnectionEndpointList";

const ServiceConnectionContainer = function(props) {
  const { service } = props;
  if (isSDKService(service)) {
    return <SDKServiceConnectionEndpointList service={service} />;
  }

  return <ServiceConnectionEndpointList service={service} />;
};

ServiceConnectionContainer.propTypes = {
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Pod),
    React.PropTypes.instanceOf(Service)
  ])
};

module.exports = ServiceConnectionContainer;
