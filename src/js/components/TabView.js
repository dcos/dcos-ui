/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

type Props = {
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
  id: string,
};

class TabView extends React.Component {

  render() {
    const classes = classNames("menu-tabbed-view", this.props.className);

    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

module.exports = TabView;
