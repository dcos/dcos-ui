import React from "react";

import Pod from "../structs/Pod";
import PodDebugContainer from "../containers/pod-debug/PodDebugContainer";
import Service from "../structs/Service";
import ServiceDebugContainer
  from "../containers/service-debug/ServiceDebugContainer";

const HighOrderServiceDebug = props => {
  const { pod, service } = props;
  if (pod != null) {
    return <PodDebugContainer pod={pod} />;
  }

  return <ServiceDebugContainer service={service} />;
};

HighOrderServiceDebug.propTypes = {
  pod: React.PropTypes.instanceOf(Pod),
  service: React.PropTypes.instanceOf(Service)
};

module.exports = HighOrderServiceDebug;
