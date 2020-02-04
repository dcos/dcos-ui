import * as React from "react";
import { i18nMark } from "@lingui/react";

export default class LoadBalancing extends React.Component {
  static routeConfig = {
    label: i18nMark("Service Addresses"),
    matches: /^\/networking\/service-addresses/
  };
  render() {
    return this.props.children;
  }
}
