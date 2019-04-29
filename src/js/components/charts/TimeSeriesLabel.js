import classNames from "classnames";
import isEqual from "lodash.isequal";
import PropTypes from "prop-types";
import React from "react";

import ValueTypes from "../../constants/ValueTypes";

class TimeSeriesLabel extends React.Component {
  shouldComponentUpdate(nextProps) {
    // If equal, do not update
    return !isEqual(this.props, nextProps);
  }

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
          className={"h3 unit-label flush-top path-color-" + props.colorIndex}
        >
          {props.subHeading}
        </span>
      </div>
    );
  }
}

TimeSeriesLabel.displayName = "TimeSeriesLabel";

TimeSeriesLabel.propTypes = {
  colorIndex: PropTypes.number,
  currentValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  subHeading: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  y: PropTypes.string
};

TimeSeriesLabel.defaultProps = {
  y: ValueTypes.PERCENTAGE,
  colorIndex: 0
};

module.exports = TimeSeriesLabel;
