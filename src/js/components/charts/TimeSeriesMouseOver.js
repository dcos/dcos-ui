import d3 from "d3";
import React from "react";

import Maths from "../../utils/Maths";

var TimeSeriesMouseOver = React.createClass({
  displayName: "TimeSeriesMouseOver",

  propTypes: {
    addMouseHandler: React.PropTypes.func.isRequired,
    data: React.PropTypes.array.isRequired,
    getBoundingBox: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    removeMouseHandler: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired,
    xScale: React.PropTypes.func.isRequired,
    y: React.PropTypes.string.isRequired,
    yScale: React.PropTypes.func.isRequired,
    yCaption: React.PropTypes.string.isRequired
  },

  componentDidMount() {
    this.props.addMouseHandler(this.handleMouseMove, this.handleMouseOut);
  },

  componentWillUnmount() {
    this.props.removeMouseHandler(this.handleMouseMove, this.handleMouseOut);
  },

  calculateMousePositionInGraph(e) {
    var boundingBox = this.props.getBoundingBox();
    var mouse = {
      x: e.clientX || e.pageX,
      y: e.clientY || e.pageY
    };

    if (
      mouse.x < boundingBox.left ||
      mouse.y < boundingBox.top ||
      mouse.x > boundingBox.right ||
      mouse.y > boundingBox.bottom
    ) {
      return false;
    }

    mouse.x -= boundingBox.left;
    mouse.y -= boundingBox.top;

    return mouse;
  },

  handleMouseMove(e) {
    var mouse = this.calculateMousePositionInGraph(e);

    // This means that mouse is out of bounds
    if (mouse === false) {
      return;
    }

    var props = this.props;
    var domain = props.xScale.domain();

    var firstDataSet = props.data[0];
    // how many data points we don't show
    var hiddenDataPoints = 1;
    // find the data point at the given mouse position
    var index =
      mouse.x *
      (firstDataSet.values.length - hiddenDataPoints - 1) /
      props.width;
    index = Math.round(index + hiddenDataPoints);

    d3
      .select(this.refs.xMousePosition)
      .transition()
      .duration(50)
      .attr("x1", mouse.x)
      .attr("x2", mouse.x);

    d3
      .select(this.refs.yMousePosition)
      .transition()
      .duration(50)
      .attr("y1", props.yScale(firstDataSet.values[index][props.y]))
      .attr("y2", props.yScale(firstDataSet.values[index][props.y]));

    d3
      .select(this.refs.yAxisCurrent)
      .transition()
      .duration(50)
      .attr("y", props.yScale(firstDataSet.values[index][props.y]))
      // Default to 0 if state is unsuccessful.
      .text((firstDataSet.values[index][props.y] || 0) + props.yCaption);

    // An extra -2 on each because we show the extra data point at the end

    var _index = mouse.x * (firstDataSet.values.length - 1) / props.width;

    var mappedValue = Maths.mapValue(Math.round(_index), {
      min: firstDataSet.values.length - hiddenDataPoints,
      max: 0
    });
    var value = Maths.unmapValue(mappedValue, {
      min: Math.abs(domain[1]),
      max: Math.abs(domain[0])
    });
    value = Math.round(value);

    var characterWidth = 7;
    var xPosition = mouse.x - value.toString().length * characterWidth;
    if (value === 0) {
      xPosition += characterWidth / 2;
    } else {
      value = "-" + value + "s";
    }
    d3
      .select(this.refs.xAxisCurrent)
      .transition()
      .duration(50)
      .attr("x", xPosition)
      // Default to 0 if state is unsuccessful.
      .text(value || 0);
  },

  handleMouseOut() {
    d3.select(this.refs.yMousePosition).interrupt();
    d3.select(this.refs.xMousePosition).interrupt();
    d3.select(this.refs.xAxisCurrent).text("");
    d3.select(this.refs.yAxisCurrent).text("");
  },

  render() {
    var height = this.props.height;

    // dy=.71em, y=9 and x=-9, dy=.32em are magic numbers from looking at
    // d3.js text values
    return (
      <g>
        <g className="x axis">
          <text
            className="current-value shadow"
            ref="xAxisCurrent"
            dy=".71em"
            y="9"
            transform={"translate(0," + height + ")"}
          />
        </g>
        <g className="y axis">
          <text
            className="current-value shadow"
            ref="yAxisCurrent"
            style={{ textAnchor: "end" }}
            dy=".32em"
            x="-9"
          />
        </g>
        <line
          className="chart-cursor-position-marker"
          ref="xMousePosition"
          y1={0}
          y2={height}
        />
        <line
          className="chart-cursor-position-marker"
          ref="yMousePosition"
          x1={0}
          x2={this.props.width}
        />
      </g>
    );
  }
});

module.exports = TimeSeriesMouseOver;
