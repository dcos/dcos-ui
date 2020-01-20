import { withI18n } from "@lingui/react";
import { t } from "@lingui/macro";
import * as React from "react";

import Chart from "#SRC/js/components/charts/Chart";

import LineChart from "./LineChart";
import utils from "../utils";

// Number to fit design of width vs. height ratio.
const WIDTH_HEIGHT_RATIO = 3.5;
// Number of data points to fill the graph with.
const TIMESERIES_DATA_POINTS = 60;

const SUCCESS_DATASET_COLORS = ["#27c97b", "#f34e3d"];
const REACHABILITY_DATASET_COLORS = [
  "#27c97b",
  "#f34e3d",
  "#16cbff",
  "#fedc39",
  "#7f33de"
];
const LATENCY_DATASET_COLORS = [
  "#27c97b",
  "#f34e3d",
  "#16cbff",
  "#fedc39",
  "#7f33de"
];

class NetworkItemChart extends React.Component {
  getChartColors() {
    if (this.props.selectedData === "success") {
      return SUCCESS_DATASET_COLORS;
    }
    if (
      this.props.selectedData === "app-reachability" ||
      this.props.selectedData === "machine-reachability"
    ) {
      return REACHABILITY_DATASET_COLORS;
    } else if (this.props.selectedData === "connection-latency") {
      return LATENCY_DATASET_COLORS;
    }
  }

  getChartData(itemData) {
    let normalizedData;

    if (this.props.selectedData === "success") {
      normalizedData = utils.normalizeTimeSeriesData(
        [itemData.getRequestSuccesses(), itemData.getRequestFailures()],
        { maxIntervals: TIMESERIES_DATA_POINTS }
      );
    } else if (this.props.selectedData === "app-reachability") {
      normalizedData = utils.normalizeTimeSeriesData(
        [
          itemData.getApplicationReachability50(),
          itemData.getApplicationReachability75(),
          itemData.getApplicationReachability90(),
          itemData.getApplicationReachability95(),
          itemData.getApplicationReachability99()
        ],
        { maxIntervals: TIMESERIES_DATA_POINTS }
      );
    } else if (this.props.selectedData === "machine-reachability") {
      normalizedData = utils.normalizeTimeSeriesData(
        [
          itemData.getMachineReachability50(),
          itemData.getMachineReachability75(),
          itemData.getMachineReachability90(),
          itemData.getMachineReachability95(),
          itemData.getMachineReachability99()
        ],
        { maxIntervals: TIMESERIES_DATA_POINTS }
      );
    } else if (this.props.selectedData === "connection-latency") {
      normalizedData = utils.normalizeTimeSeriesData(
        [
          itemData.getConnectionLatency50(),
          itemData.getConnectionLatency75(),
          itemData.getConnectionLatency90(),
          itemData.getConnectionLatency95(),
          itemData.getConnectionLatency99()
        ],
        { maxIntervals: TIMESERIES_DATA_POINTS }
      );
    }

    return normalizedData;
  }

  getChartDataLabels() {
    const { selectedData, i18n } = this.props;

    if (selectedData === "success") {
      return [
        i18n._(t`Minutes ago`),
        i18n._(t`Successes`),
        i18n._(t`Failures`)
      ];
    }
    if (
      selectedData === "app-reachability" ||
      selectedData === "machine-reachability" ||
      selectedData === "connection-latency"
    ) {
      return [i18n._(t`Minutes ago`), "P50", "P75", "P90", "P95", "P99"];
    }
  }

  getChartYAxisLabel() {
    const { selectedData, i18n } = this.props;

    switch (selectedData) {
      case "success":
        return i18n._(t`Requests`);
      case "app-reachability":
        return i18n._(t`App Reachability`);
      case "machine-reachability":
        return i18n._(t`IP Reachability`);
      case "connection-latency":
        return i18n._(t`Connection Latency <em>(in ms)</em>`);
    }
  }

  labelFormatter(x) {
    if (x === 0) {
      return 0;
    }

    return `-${x}m`;
  }

  render() {
    const colors = this.getChartColors();
    const data = this.getChartData(this.props.chartData);
    const dataLabels = this.getChartDataLabels();
    const yAxisLabel = this.getChartYAxisLabel();

    const labels = [];
    for (let i = TIMESERIES_DATA_POINTS; i >= 0; i--) {
      labels.push(i);
    }

    const chartOptions = {
      axes: {
        x: {
          axisLabelFormatter: this.labelFormatter,
          valueFormatter: this.labelFormatter,
          gridLinePattern: [4, 4],
          // Max of 4 chars (-60m) and each character is 10px in length
          axisLabelWidth: 4 * 10
        },
        y: {
          gridLinePattern: 55,
          axisLabelWidth: 4 * 10
        }
      },
      colors,
      labels: dataLabels,
      ylabel: yAxisLabel
    };

    return (
      <div className="pod pod-short flush-right flush-left">
        <Chart calcHeight={w => w / WIDTH_HEIGHT_RATIO} delayRender={true}>
          <LineChart
            data={data}
            key={this.props.selectedData}
            labels={labels}
            chartOptions={chartOptions}
          />
        </Chart>
      </div>
    );
  }
}

export default withI18n()(NetworkItemChart);
