import React from "react";

import Chart from "./Chart";
import TimeSeriesChart from "./TimeSeriesChart";
import TimeSeriesLabel from "./TimeSeriesLabel";
import ValueTypes from "../../constants/ValueTypes";

var HostTimeSeriesChart = React.createClass({
  displayName: "HostTimeSeriesChart",

  propTypes: {
    data: React.PropTypes.array.isRequired,
    refreshRate: React.PropTypes.number.isRequired,
    roundUpValue: React.PropTypes.number,
    minMaxY: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      roundUpValue: 5,
      minMaxY: 10
    };
  },

  getMaxY() {
    var props = this.props;
    var roundUpValue = props.roundUpValue;
    const slavesCounts = props.data.map(function(agent) {
      return agent.slavesCount;
    });
    const maxSlavesCount = Math.max(...slavesCounts);

    var maxY = maxSlavesCount + (roundUpValue - maxSlavesCount % roundUpValue);

    if (maxY < props.minMaxY) {
      maxY = props.minMaxY;
    }

    return maxY;
  },

  getData(props) {
    return [
      {
        name: "Nodes",
        colorIndex: 4,
        values: props.data
      }
    ];
  },

  getChart(props) {
    return (
      <Chart>
        <TimeSeriesChart
          data={this.getData(props)}
          maxY={this.getMaxY()}
          refreshRate={props.refreshRate}
          y="slavesCount"
          yFormat={ValueTypes.ABSOLUTE}
        />
      </Chart>
    );
  },

  render() {
    var props = this.props;

    return (
      <div className="chart">
        <TimeSeriesLabel
          colorIndex={4}
          currentValue={props.currentValue}
          subHeading={"Connected Nodes"}
          y="slavesCount"
        />
        {this.getChart(props)}
      </div>
    );
  }
});

module.exports = HostTimeSeriesChart;
