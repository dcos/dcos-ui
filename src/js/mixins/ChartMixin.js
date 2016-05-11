var d3 = require('d3');

var ChartMixin = {
  getXScale: function (data = [], width, refreshRate) {
    var length = width;
    var firstDataSet = data[0];
    if (firstDataSet != null) {
      length = firstDataSet.values.length;
    }

    var timeAgo = -(length - 1) * (refreshRate / 1000);

    return d3.scale.linear()
      .range([0, width])
      .domain([timeAgo, 0]);
  },

  // Only used by TimeSeriesChart, but is meant to be re-used elsewhere
  getHeight: function (props) {
    var margin = props.margin;
    return props.height - margin.top - margin.bottom;
  },

  // Only used by TimeSeriesChart, but is meant to be re-used elsewhere
  getWidth: function (props) {
    var margin = props.margin;
    return props.width - margin.left - margin.right;
  },

  formatXAxis: function (d) {
    let hideMatch = this.props.axisConfiguration.x.hideMatch;
    if (hideMatch && hideMatch.test(d.toString())) {
      return '';
    }

    if (parseInt(Math.abs(d)) > 0) {
      return `${d}s`;
    }

    return d;
  }
};

module.exports = ChartMixin;
