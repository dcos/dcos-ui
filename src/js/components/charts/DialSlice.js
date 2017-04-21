import classNames from "classnames";
import React from "react";

var DialSlice = React.createClass({
  displayName: "DialSlice",

  propTypes: {
    colorIndex: React.PropTypes.node,
    path: React.PropTypes.string.isRequired
  },

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
});

module.exports = DialSlice;
