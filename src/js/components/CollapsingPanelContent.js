/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

type Props = {
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string
};

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

module.exports = CollapsingPanelContent;
