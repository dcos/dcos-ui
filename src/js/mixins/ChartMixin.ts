import d3 from "d3";

const ChartMixin = {
  getXScale(data = [], width, refreshRate) {
    let length = width;
    const firstDataSet = data[0];
    if (firstDataSet != null) {
      length = firstDataSet.values.length;
    }

    const timeAgo = -(length - 1) * (refreshRate / 1000);

    return d3.scale
      .linear()
      .range([0, width])
      .domain([timeAgo, 0]);
  },

  // Only used by TimeSeriesChart, but is meant to be re-used elsewhere
  getHeight(props) {
    const margin = props.margin;

    return props.height - margin.top - margin.bottom;
  },

  // Only used by TimeSeriesChart, but is meant to be re-used elsewhere
  getWidth(props) {
    const margin = props.margin;

    return props.width - margin.left - margin.right;
  },

  formatXAxis(d) {
    const hideMatch = this.props.axisConfiguration.x.hideMatch;
    if (hideMatch && hideMatch.test(d.toString())) {
      return "";
    }

    if (parseInt(Math.abs(d), 10) > 0) {
      return `${d}s`;
    }

    return d;
  }
};

export default ChartMixin;
