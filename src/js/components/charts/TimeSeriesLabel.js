var classNames = require('classnames');
import deepEqual from 'deep-equal';
var React = require('react');

var ValueTypes = require('../../constants/ValueTypes');

var TimeSeriesLabel = React.createClass({

  displayName: 'TimeSeriesLabel',

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

  getDefaultProps: function () {
    return {
      y: ValueTypes.PERCENTAGE,
      colorIndex: 0
    };
  },

  shouldComponentUpdate: function (nextProps) {
    // If equal, do not update
    return !deepEqual(this.props, nextProps);
  },

  render: function () {
    var props = this.props;

    var percentageClassSet = classNames({
      'hidden': props.y !== ValueTypes.PERCENTAGE
    });

    return (
      <div className="text-align-center">
        <span className="h1 h1-large inverse flush unit">
          {props.currentValue}
          <sup className={percentageClassSet}>%</sup>
        </span>
        <span className={'h4 unit-label flush-top tall-bottom path-color-' + props.colorIndex}>
          {props.subHeading}
        </span>
      </div>
    );
  }
});

module.exports = TimeSeriesLabel;
