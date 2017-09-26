import classNames from "classnames/dedupe";
import React from "react";

class FullScreenModalHeaderSubTitle extends React.Component {
  render() {
    const { children, className } = this.props;
    const classes = classNames("small", className);

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

FullScreenModalHeaderSubTitle.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: classProps
};

module.exports = FullScreenModalHeaderSubTitle;
