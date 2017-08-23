/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import Icon from "./Icon";

type Props = {
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
  isExpanded?: boolean,
  onClick?: Function
};

class CollapsingPanelHeader extends React.Component {

  getStateIndicator() {
    let iconID = "caret-down";

    if (this.props.isExpanded) {
      iconID = "caret-up";
    }

    return <Icon id={iconID} color="neutral" size="mini" />;
  }

  render() {
    const classes = classNames(
      "panel-cell panel-cell-header panel-cell-short clickable",
      this.props.className
    );

    return (
      <div className={classes} onClick={this.props.onClick}>
        {this.props.children}
        {this.getStateIndicator()}
      </div>
    );
  }
}

module.exports = CollapsingPanelHeader;
