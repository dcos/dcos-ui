import React, { Component, ComponentFactory } from "react";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

interface ServiceStatusIconProps {
  showTooltip?: Boolean;
  tooltipContent: any;
  service: Service | ServiceTree | Pod;
}

export default class ServiceStatusIcon extends Component<ServiceStatusIconProps> {}
