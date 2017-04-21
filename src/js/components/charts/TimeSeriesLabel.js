import classNames from "classnames";
import deepEqual from "deep-equal";
import React from "react";

import ValueTypes from "../../constants/ValueTypes";

var TimeSeriesLabel = React.createClass({
  displayName: "TimeSeriesLabel",

  propTypes: {
    colorIndex: React.PropTypes.number,
    currentValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    subHeading: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    y: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      y: ValueTypes.PERCENTAGE,
      colorIndex: 0
    };
  },

  shouldComponentUpdate(nextProps) {
    // If equal, do not update
    return !deepEqual(this.props, nextProps);
  },

  render() {
    var props = this.props;

    var percentageClassSet = classNames({
      hidden: props.y !== ValueTypes.PERCENTAGE
    });

    return (
      <div className="text-align-center">
        <span className="unit unit-primary">
          {props.currentValue}
          <sup className={percentageClassSet}>%</sup>
        </span>
        <span
          className={"h4 unit-label flush-top path-color-" + props.colorIndex}
        >
          {props.subHeading}
        </span>
      </div>
    );
  }
});

module.exports = TimeSeriesLabel;
