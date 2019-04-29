import d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

import Maths from "../../utils/Maths";

const METHODS_TO_BIND = ["handleMouseMove", "handleMouseOut"];

class TimeSeriesMouseOver extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.props.addMouseHandler(this.handleMouseMove, this.handleMouseOut);
  }

  componentWillUnmount() {
    this.props.removeMouseHandler(this.handleMouseMove, this.handleMouseOut);
  }

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
  }

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
      (mouse.x * (firstDataSet.values.length - hiddenDataPoints - 1)) /
      props.width;
    index = Math.round(index + hiddenDataPoints);

    d3.select(this.xMousePositionRef)
      .style("opacity", 1)
      .transition()
      .duration(50)
      .attr("x1", mouse.x)
      .attr("x2", mouse.x);

    d3.select(this.yMousePositionRef)
      .style("opacity", 1)
      .transition()
      .duration(50)
      .attr("y1", props.yScale(firstDataSet.values[index][props.y]))
      .attr("y2", props.yScale(firstDataSet.values[index][props.y]));

    d3.select(this.yAxisCurrentRef)
      .transition()
      .duration(50)
      .attr("y", props.yScale(firstDataSet.values[index][props.y]))
      // Default to 0 if state is unsuccessful.
      .text((firstDataSet.values[index][props.y] || 0) + props.yCaption);

    // An extra -2 on each because we show the extra data point at the end

    var _index = (mouse.x * (firstDataSet.values.length - 1)) / props.width;

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
    d3.select(this.xAxisCurrentRef)
      .transition()
      .duration(50)
      .attr("x", xPosition)
      // Default to 0 if state is unsuccessful.
      .text(value || 0);
  }

  handleMouseOut() {
    d3.select(this.yMousePositionRef)
      .interrupt()
      .style("opacity", 0);
    d3.select(this.xMousePositionRef)
      .interrupt()
      .style("opacity", 0);
    d3.select(this.xAxisCurrentRef).text("");
    d3.select(this.yAxisCurrentRef).text("");
  }

  render() {
    var height = this.props.height;

    // dy=.71em, y=9 and x=-9, dy=.32em are magic numbers from looking at
    // d3.js text values
    return (
      <g>
        <g className="x axis">
          <text
            className="current-value shadow"
            ref={ref => (this.xAxisCurrentRef = ref)}
            dy=".71em"
            y="9"
            transform={"translate(0," + height + ")"}
          />
        </g>
        <g className="y axis">
          <text
            className="current-value shadow"
            ref={ref => (this.yAxisCurrentRef = ref)}
            style={{ textAnchor: "end" }}
            dy=".32em"
            x="-9"
          />
        </g>
        <line
          className="chart-cursor-position-marker"
          ref={ref => (this.xMousePositionRef = ref)}
          style={{ opacity: 0 }}
          y1={0}
          y2={height}
        />
        <line
          className="chart-cursor-position-marker"
          ref={ref => (this.yMousePositionRef = ref)}
          style={{ opacity: 0 }}
          x1={0}
          x2={this.props.width}
        />
      </g>
    );
  }
}

TimeSeriesMouseOver.displayName = "TimeSeriesMouseOver";

TimeSeriesMouseOver.propTypes = {
  addMouseHandler: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  getBoundingBox: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  removeMouseHandler: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  y: PropTypes.string.isRequired,
  yScale: PropTypes.func.isRequired,
  yCaption: PropTypes.string.isRequired
};

module.exports = TimeSeriesMouseOver;
