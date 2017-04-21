import classNames from "classnames/dedupe";
import React from "react";

import Icon from "./Icon";

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

CollapsingPanelHeader.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  isExpanded: React.PropTypes.bool,
  onClick: React.PropTypes.func
};

module.exports = CollapsingPanelHeader;
