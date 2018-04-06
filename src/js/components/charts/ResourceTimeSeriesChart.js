import PropTypes from "prop-types";
import React from "react";

import Chart from "./Chart";
import TimeSeriesChart from "./TimeSeriesChart";
import TimeSeriesLabel from "./TimeSeriesLabel";
import Units from "../../utils/Units";

var ResourceTimeSeriesChart = React.createClass({
  displayName: "ResourceTimeSeriesChart",

  propTypes: {
    colorIndex: PropTypes.number.isRequired,
    usedResources: PropTypes.object.isRequired,
    totalResources: PropTypes.object.isRequired,
    usedResourcesStates: PropTypes.object.isRequired,
    mode: PropTypes.string,
    refreshRate: PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      colorIndex: 0
    };
  },

  getData() {
    const { colorIndex, usedResourcesStates, mode } = this.props;

    return [
      {
        name: "Alloc",
        colorIndex,
        values: usedResourcesStates[mode]
      }
    ];
  },

  getHeadline(usedValue, totalValue) {
    const { mode } = this.props;
    if (mode === "cpus" || mode === "gpus") {
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
    const { refreshRate } = this.props;

    return (
      <Chart>
        <TimeSeriesChart
          data={this.getData()}
          maxY={100}
          y="percentage"
          refreshRate={refreshRate}
        />
      </Chart>
    );
  },

  render() {
    const { colorIndex, mode, usedResources, totalResources } = this.props;
    const usedValue = +(Math.round(usedResources[mode] + "e+2") + "e-2");
    const totalValue = +(Math.round(totalResources[mode] + "e+2") + "e-2");
    const percentage = Math.round(100 * usedValue / totalValue) || 0;

    return (
      <div className="chart">
        <TimeSeriesLabel
          colorIndex={colorIndex}
          currentValue={percentage}
          subHeading={this.getHeadline(usedValue, totalValue)}
        />
        {this.getChart()}
      </div>
    );
  }
});

module.exports = ResourceTimeSeriesChart;
