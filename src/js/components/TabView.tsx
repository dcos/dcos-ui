import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import * as React from "react";

const TabView = ({ className, children }) => {
  const classes = classNames("menu-tabbed-view", className);

  return <div className={classes}>{children}</div>;
};

TabView.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOf([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
  ]),
  id: PropTypes.string.isRequired,
};

export default TabView;
