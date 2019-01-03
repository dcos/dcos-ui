import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

class DialSlice extends React.Component {
  render() {
    var classes = {
      arc: true
    };
    if (this.props.colorIndex != null) {
      classes["path-color-" + this.props.colorIndex] = true;
    }
    var classSet = classNames(classes);

    return (
      <g className={classSet}>
        <path d={this.props.path} />
      </g>
    );
  }
}

DialSlice.displayName = "DialSlice";

DialSlice.propTypes = {
  colorIndex: PropTypes.node,
  path: PropTypes.string.isRequired
};

module.exports = DialSlice;
