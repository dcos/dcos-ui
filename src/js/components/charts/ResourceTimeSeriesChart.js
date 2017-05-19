import React from "react";

import Chart from "./Chart";
import TimeSeriesChart from "./TimeSeriesChart";
import TimeSeriesLabel from "./TimeSeriesLabel";
import Units from "../../utils/Units";

var ResourceTimeSeriesChart = React.createClass({
  displayName: "ResourceTimeSeriesChart",

  propTypes: {
    colorIndex: React.PropTypes.number.isRequired,
    usedResources: React.PropTypes.object.isRequired,
    totalResources: React.PropTypes.object.isRequired,
    usedResourcesStates: React.PropTypes.object.isRequired,
    mode: React.PropTypes.string,
    refreshRate: React.PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      colorIndex: 0
    };
  },

  getData() {
    var props = this.props;

    return [
      {
        name: "Alloc",
        colorIndex: this.props.colorIndex,
        values: props.usedResourcesStates[props.mode]
      }
    ];
  },

  getHeadline(usedValue, totalValue) {
    if (this.props.mode === "cpus") {
      return usedValue + " of " + totalValue + " Shares";
    } else {
      return (
        Units.filesize(usedValue * 1024 * 1024, 0) +
        " of " +
        Units.filesize(totalValue * 1024 * 1024, 0)
      );
    }
  },

  getChart() {
    var props = this.props;

    return (
      <Chart>
        <TimeSeriesChart
          data={this.getData()}
          maxY={100}
          y="percentage"
          refreshRate={props.refreshRate}
        />
      </Chart>
    );
  },

  render() {
    var props = this.props;
    var usedValue = props.usedResources[props.mode];
    var totalValue = props.totalResources[props.mode];
    const percentage = Math.round(100 * usedValue / totalValue) || 0;

    return (
      <div className="chart">
        <TimeSeriesLabel
          colorIndex={this.props.colorIndex}
          currentValue={percentage}
          subHeading={this.getHeadline(usedValue, totalValue)}
        />
        {this.getChart()}
      </div>
    );
  }
});

module.exports = ResourceTimeSeriesChart;
