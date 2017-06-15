import d3 from "d3";

var ChartMixin = {
  getXScale(data = [], width, refreshRate) {
    var length = width;
    var firstDataSet = data[0];
    if (firstDataSet != null) {
      length = firstDataSet.values.length;
    }

    var timeAgo = -(length - 1) * (refreshRate / 1000);

    return d3.scale.linear().range([0, width]).domain([timeAgo, 0]);
  },

  // Only used by TimeSeriesChart, but is meant to be re-used elsewhere
  getHeight(props) {
    var margin = props.margin;

    return props.height - margin.top - margin.bottom;
  },

  // Only used by TimeSeriesChart, but is meant to be re-used elsewhere
  getWidth(props) {
    var margin = props.margin;

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

module.exports = ChartMixin;
