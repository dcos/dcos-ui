/* @flow */
import classNames from "classnames";
import React from "react";

type Props = {
  isCaret?: boolean,
  isIcon?: boolean,
  title: string
};

class Breadcrumb extends React.Component {

  render() {
    const { children, isCaret, isIcon } = this.props;

    if (!children) {
      return <noscript />;
    }

    const classes = classNames("breadcrumb", {
      "breadcrumb--is-caret": isCaret,
      "breadcrumb--is-icon": isIcon
    });

    return (
      <div className={classes}>
        {children}
      </div>
    );
  }
}

Breadcrumb.defaultProps = {
  isCaret: false,
  isIcon: false
};

module.exports = Breadcrumb;
