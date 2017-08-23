/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

type Props = {
  children: number | string | React.Element | Array<any>,
  className?: classProps,
};

class FullScreenModalHeader extends React.Component {

  render() {
    const { children, className } = this.props;
    const classes = classNames("modal-full-screen-header pod", className);

    return (
      <div className={classes}>
        {children}
      </div>
    );
  }
}

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

module.exports = FullScreenModalHeader;
