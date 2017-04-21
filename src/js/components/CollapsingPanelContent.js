import classNames from "classnames/dedupe";
import React from "react";

class CollapsingPanelContent extends React.Component {
  render() {
    const classes = classNames(
      "panel-cell panel-cell-content",
      this.props.className
    );

    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

CollapsingPanelContent.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = CollapsingPanelContent;
