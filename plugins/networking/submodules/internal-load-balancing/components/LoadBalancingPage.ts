import * as React from "react";
import { i18nMark } from "@lingui/react";

class LoadBalancing extends React.Component {
  render() {
    return this.props.children;
  }
}

LoadBalancing.routeConfig = {
  label: i18nMark("Service Addresses"),
  matches: /^\/networking\/service-addresses/,
};

export default LoadBalancing;
