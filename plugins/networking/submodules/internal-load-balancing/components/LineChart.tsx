import classNames from "classnames";
import deepEqual from "deep-equal";
import Dygraph from "dygraphs";
import PropTypes from "prop-types";
import * as React from "react";

import Units from "#SRC/js/utils/Units";

class LineChart extends React.Component {
  static defaultProps = {
    chartOptions: {
      drawPoints: false,
      axisLineColor: "#CBCED1",
      gridLineColor: "#CBCED1",
      highlightSeriesBackgroundAlpha: 1,
      highlightSeriesOpts: {
        strokeBorderColor: "#ffffff",
        strokeBorderWidth: 0.5,
        strokeWidth: 1.75,
        highlightCircleSize: 3,
      },
      labelsDiv: "dygraph-hover-label",
      labelsSeparateLines: true,
      legend: "follow",
      yLabelWidth: 200,
      showLabelsOnHighlight: true,
      strokeWidth: 1.25,
      axes: {
        y: {
          axisLabelWidth: 35,
        },
      },
    },
  };
  static propTypes = {
    labels: PropTypes.array.isRequired,
    data: PropTypes.arrayOf(PropTypes.array.isRequired).isRequired,
    chartOptions: PropTypes.object,
  };

  state = { disabledSeries: {} };
  chartRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const options = this.getOptions();

    this.graph = new Dygraph(
      this.chartRef.current,
      this.getGraphData(),
      options
    );
  }

  componentDidUpdate(prevProps) {
    const props = this.props;
    const options = Object.assign(this.getOptions(), {
      file: this.getGraphData(),
    });

    this.graph.updateOptions(options);

    if (prevProps.width !== props.width || prevProps.height !== props.height) {
      this.graph.resize(props.width, props.height);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.height !== this.props.height ||
      nextProps.width !== this.props.width
    ) {
      return true;
    }

    if (!deepEqual(nextProps.labels, this.props.labels)) {
      return true;
    }

    if (!deepEqual(nextProps.data, this.props.data)) {
      return true;
    }

    if (!deepEqual(nextState.disabledSeries, this.state.disabledSeries)) {
      return true;
    }

    return false;
  }

  handleLabelToggle(seriesID) {
    const visibleSeries = this.graph.visibility();
    const isEnabled = visibleSeries[seriesID];
    const disabledSeries = {
      ...this.state.disabledSeries,
    };

    if (isEnabled) {
      disabledSeries[seriesID] = isEnabled;
      this.graph.setVisibility(seriesID, !isEnabled);
    } else {
      delete disabledSeries[seriesID];
      this.graph.setVisibility(seriesID, !isEnabled);
    }

    this.setState({ disabledSeries });
  }

  hasYAxisFormatter(options) {
    return options.axes && options.axes.y && options.axes.y.axisLabelFormatter;
  }

  getMaxLengthForSet(set) {
    let longestValue = 1;
    set.forEach((value) => {
      const valueString = value.toString();
      if (valueString.length > longestValue) {
        longestValue = valueString.length;
      }
    });

    return longestValue;
  }

  getOptions() {
    const options = {
      height: this.props.height,
      width: this.props.width,
      ...LineChart.defaultProps.chartOptions,
      ...this.props.chartOptions,
    };

    if (!this.hasYAxisFormatter(this.props.chartOptions)) {
      if (!options.axes) {
        options.axes = {};
      }

      if (!options.axes.y) {
        options.axes.y = {};
      }

      options.axes.y.axisLabelFormatter = this.labelFormatter;
      options.axes.y.valueFormatter = this.labelFormatter;
    }

    return options;
  }

  getGraphData() {
    return this.transpose(this.props.labels, this.props.data);
  }

  /**
   * Will take in an array of labels and array of lines
   * with their datapoints and will get the data ready for dygraphs
   * For example: (['a', 'b'], [[1, 2], [3, 4]]) will return:
   * [['a', 1, 3], ['b', 2, 4]]
   *
   * @param  {Array} labels
   * @param  {Array} data
   * @return {Array} An array
   */
  transpose(labels, data) {
    return labels.map((label, labelIndex) => {
      const xPoints = [label];
      for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
        xPoints.push(data[dataIndex][labelIndex]);
      }

      return xPoints;
    });
  }

  getLegend() {
    const labels = this.props.chartOptions.labels;

    if (!labels) {
      return null;
    }

    const labelsHTML = labels.map((label, i) => {
      // The first index is the label for X, we don't want it.
      if (i === 0) {
        return null;
      }

      // From here on, the indexes start at 0
      const index = i - 1;
      const style = {
        // -1 because we don't have a color for x
        backgroundColor: this.props.chartOptions.colors[index],
      };

      const classes = classNames({
        clickable: true,
        disabled: this.state.disabledSeries[index],
      });

      return (
        <span
          className={classes}
          key={i}
          onClick={this.handleLabelToggle.bind(this, index)}
        >
          <span className="dot success" style={style} />
          {label}
        </span>
      );
    });

    // Pop off the first element
    labelsHTML.shift();

    return <div className="graph-legend">{labelsHTML}</div>;
  }

  labelFormatter(y) {
    return Units.contractNumber(y, { forceFixedPrecision: true });
  }

  render() {
    return (
      <div className="dygraph-chart-wrapper">
        <div id="dygraph-hover-label" className="dygraph-hover-label" />
        <div ref={this.chartRef} className="dygraph-chart" />
        {this.getLegend()}
      </div>
    );
  }
}

export default LineChart;
