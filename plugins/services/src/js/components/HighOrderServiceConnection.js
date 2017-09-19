import React from "react";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import Service from "../structs/Service";
import Pod from "../structs/Pod";
import ServiceConnectionContainer
  from "../containers/service-connection/ServiceConnectionContainer";
import SDKServiceConnectionContainer
  from "../containers/service-connection/SDKServiceConnectionContainer";

const HighOrderServiceConnection = function(props) {
  const { service } = props;
  if (isSDKService(service)) {
    return <SDKServiceConnectionContainer service={service} />;
  }

  return <ServiceConnectionContainer service={service} />;
};

HighOrderServiceConnection.propTypes = {
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Pod),
    React.PropTypes.instanceOf(Service)
  ])
};

module.exports = HighOrderServiceConnection;
