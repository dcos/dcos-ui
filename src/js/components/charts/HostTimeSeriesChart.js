import { withI18n } from "@lingui/react";
import { t } from "@lingui/macro";

import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";

import Chart from "./Chart";
import TimeSeriesChart from "./TimeSeriesChart";
import TimeSeriesLabel from "./TimeSeriesLabel";
import ValueTypes from "../../constants/ValueTypes";

var HostTimeSeriesChart = createReactClass({
  displayName: "HostTimeSeriesChart",

  propTypes: {
    data: PropTypes.array.isRequired,
    refreshRate: PropTypes.number.isRequired,
    roundUpValue: PropTypes.number,
    minMaxY: PropTypes.number,
    colorIndex: PropTypes.number
  },

  getDefaultProps() {
    return {
      roundUpValue: 5,
      minMaxY: 10,
      colorIndex: 0
    };
  },

  getMaxY() {
    var props = this.props;
    var roundUpValue = props.roundUpValue;
    const slavesCounts = props.data.map(function(agent) {
      return agent.slavesCount;
    });
    const maxSlavesCount = Math.max(...slavesCounts);

    var maxY =
      maxSlavesCount + (roundUpValue - (maxSlavesCount % roundUpValue));

    if (maxY < props.minMaxY) {
      maxY = props.minMaxY;
    }

    return maxY;
  },

  getData(props) {
    return [
      {
        name: "Nodes",
        colorIndex: props.colorIndex,
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
    const props = this.props;
    const i18n = props.i18n;

    return (
      <div className="chart">
        <TimeSeriesLabel
          colorIndex={props.colorIndex}
          currentValue={props.currentValue}
          subHeading={i18n._(t`Connected Nodes`)}
          y="slavesCount"
        />
        {this.getChart(props)}
      </div>
    );
  }
});

module.exports = withI18n()(HostTimeSeriesChart);
