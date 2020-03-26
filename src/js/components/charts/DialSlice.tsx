import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import createReactClass from "create-react-class";

const DialSlice = createReactClass({
  displayName: "DialSlice",

  propTypes: {
    colorIndex: PropTypes.node,
    path: PropTypes.string.isRequired,
  },

  render() {
    const classes = {
      arc: true,
    };
    if (this.props.colorIndex != null) {
      classes["path-color-" + this.props.colorIndex] = true;
    }
    const classSet = classNames(classes);

    return (
      <g className={classSet}>
        <path d={this.props.path} />
      </g>
    );
  },
});

export default DialSlice;
