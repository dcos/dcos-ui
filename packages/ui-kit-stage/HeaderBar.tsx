/**
 * Component: HeaderBar
 * Added: 2018-07-08
 * JIRA: https://jira.mesosphere.com/browse/DCOS-39074
 */
import * as React from "react";

// TODO: DCOS-39074
export class HeaderBar extends React.PureComponent {
  render() {
    return <div className="header-bar">{this.props.children}</div>;
  }
}
