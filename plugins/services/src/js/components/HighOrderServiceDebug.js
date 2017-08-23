/* @flow */
import React from "react";

import Pod from "../structs/Pod";
import PodDebugContainer from "../containers/pod-debug/PodDebugContainer";
import Service from "../structs/Service";
import ServiceDebugContainer
  from "../containers/service-debug/ServiceDebugContainer";

type Props = { service?: Pod | Service };

const HighOrderServiceDebug = function(props: Props) {
  const { service } = props;
  if (service instanceof Pod) {
    return <PodDebugContainer pod={service} />;
  }

  return <ServiceDebugContainer service={service} />;
};

module.exports = HighOrderServiceDebug;
