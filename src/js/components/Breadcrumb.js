import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

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

    return <div className={classes}>{children}</div>;
  }
}

Breadcrumb.defaultProps = {
  isCaret: false,
  isIcon: false
};

Breadcrumb.propTypes = {
  isCaret: PropTypes.bool,
  isIcon: PropTypes.bool,
  title: PropTypes.string.isRequired
};

export default Breadcrumb;
