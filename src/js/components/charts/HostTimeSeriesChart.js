var React = require('react');

var Chart = require('./Chart');
var TimeSeriesChart = require('./TimeSeriesChart');
var TimeSeriesLabel = require('./TimeSeriesLabel');
var ValueTypes = require('../../constants/ValueTypes');

var HostTimeSeriesChart = React.createClass({

  displayName: 'HostTimeSeriesChart',

  propTypes: {
    data: React.PropTypes.array.isRequired,
    refreshRate: React.PropTypes.number.isRequired,
    roundUpValue: React.PropTypes.number,
    minMaxY: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      roundUpValue: 5,
      minMaxY: 10
    };
  },

  getMaxY: function () {
    var props = this.props;
    var roundUpValue = props.roundUpValue;
    let slavesCounts = props.data.map(function (agent) {
      return agent.slavesCount;
    });
    let maxSlavesCount = Math.max(...slavesCounts);

    var maxY = maxSlavesCount +
      (roundUpValue - (maxSlavesCount % roundUpValue));

    if (maxY < props.minMaxY) {
      maxY = props.minMaxY;
    }

    return maxY;
  },

  getData: function (props) {
    return [{
      name: 'Nodes',
      colorIndex: 4,
      values: props.data
    }];
  },

  getChart: function (props) {
    return (
      <Chart>
        <TimeSeriesChart
          data={this.getData(props)}
          maxY={this.getMaxY()}
          refreshRate={props.refreshRate}
          y="slavesCount"
          yFormat={ValueTypes.ABSOLUTE} />
      </Chart>
    );
  },

  render: function () {
    var props = this.props;

    return (
      <div className="chart">
        <TimeSeriesLabel
          colorIndex={4}
          currentValue={props.currentValue}
          subHeading={'Connected Nodes'}
          y="slavesCount" />
        {this.getChart(props)}
      </div>
    );
  }
});

module.exports = HostTimeSeriesChart;
