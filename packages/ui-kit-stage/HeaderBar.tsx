/**
 * Component: HeaderBar
 * Added: 2018-07-08
 * JIRA: https://jira.mesosphere.com/browse/DCOS-39074
 */
import * as React from "react";
import { coreColors } from "@dcos/ui-kit/dist/packages/shared/styles/color";

// TODO: DCOS-39074
const headerBarStyles: object = {
  backgroundColor: coreColors().purpleDarken4,
  height: "32px",
  width: "100%",
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "auto",
  zIndex: 999
};

export class HeaderBar extends React.PureComponent {
  render() {
    return <div style={headerBarStyles}>{this.props.children}</div>;
  }
}
