import PropTypes from "prop-types";
import React from "react";

import Pod from "../structs/Pod";
import PodDebugContainer from "../containers/pod-debug/PodDebugContainer";
import Service from "../structs/Service";
import ServiceDebugContainer from "../containers/service-debug/ServiceDebugContainer";

const HighOrderServiceDebug = function(props) {
  const { service } = props;
  if (service instanceof Pod) {
    return <PodDebugContainer pod={service} />;
  }

  return <ServiceDebugContainer service={service} />;
};

HighOrderServiceDebug.propTypes = {
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(Pod),
    PropTypes.instanceOf(Service)
  ])
};

export default HighOrderServiceDebug;
