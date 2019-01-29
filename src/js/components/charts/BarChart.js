import classNames from "classnames";
import d3 from "d3";
import isEqual from "lodash.isequal";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import ReactDOM from "react-dom";

import Bar from "./Bar";
import ChartMixin from "../../mixins/ChartMixin";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";
import Util from "../../utils/Util";

var BarChart = createReactClass({
  displayName: "BarChart",

  mixins: [ChartMixin, InternalStorageMixin],

  propTypes: {
    axisConfiguration: PropTypes.object,
    data: PropTypes.array.isRequired,
    // `height` and `width` are required if this
    // module isn't used as a child of the `Chart` component
    // Otherwise Chart will automatically calculate this.
    height: PropTypes.number,
    inverseStyle: PropTypes.bool,
    peakline: PropTypes.bool,
    refreshRate: PropTypes.number.isRequired,
    y: PropTypes.string,
    width: PropTypes.number
  },

  getDefaultProps() {
    return {
      axisConfiguration: {
        x: { hideMatch: false },
        y: { hideMatch: false, showPercentage: true }
      },
      inverseStyle: false,
      margin: {
        top: 0,
        right: 5,
        bottom: 40,
        left: 43
      },
      maxY: 10,
      peakline: false,
      ticksY: 10,
      transition: {
        delay: 200,
        duration: 800
      },
      refreshRate: 0,
      xGridLines: null,
      y: "y"
    };
  },

  shouldComponentUpdate(nextProps) {
    return (
      this.props.height !== nextProps.height ||
      this.props.width !== nextProps.width ||
      !isEqual(this.props.data, nextProps.data)
    );
  },

  componentWillMount() {
    var props = this.props;

    var width = this.getWidth(props);
    var xScale = this.getXScale(props.data, width, props.refreshRate);
    var yScale = this.getYScale(props);

    var data = {
      stack: this.getStack(),
      xScale,
      yScale,
      clipPathID: `clip-${Util.uniqueID()}`
    };

    this.internalStorage_set(data);

    // #prepareValues needs data.stack, so we must set that first
    this.internalStorage_update(this.prepareValues(this.props));
  },

  componentDidMount() {
    var data = this.internalStorage_get();
    var props = this.props;

    this.renderAxis(props, data.xScale, data.yScale);
    this.createClipPath();
    this.resetXAxis(props);
  },

  componentWillReceiveProps(props) {
    var width = this.getWidth(props);
    var xScale = this.getXScale(props.data, width, props.refreshRate);
    var yScale = this.getYScale(props);
    // the d3 axis helper requires a <g> element passed into do its work. This
    // happens after mount and ends up keeping the axis code outside of react
    // unfortunately.
    this.renderAxis(props, xScale, yScale);

    this.internalStorage_update(
      Object.assign(this.prepareValues(props), {
        xScale,
        yScale
      })
    );

    this.resetXAxis(props);
  },

  componentDidUpdate() {
    this.updateClipPath();
  },

  createClipPath() {
    var data = this.internalStorage_get();
    var el = ReactDOM.findDOMNode(this);

    d3.select(el)
      .append("defs")
      .append("clipPath")
      .attr("id", data.clipPathID)
      .append("rect");

    this.updateClipPath();
  },

  updateClipPath() {
    var data = this.internalStorage_get();
    var props = this.props;
    var width = props.width - props.margin.left - props.margin.right;
    var height = props.height + 1; // +1 for the base axis line

    d3.select("#" + data.clipPathID + " rect").attr({
      width,
      height
    });
  },

  getStack() {
    return d3.layout
      .stack()
      .values(function(d) {
        return d.values;
      })
      .x(function(d) {
        return d.date;
      });
  },

  getYScale(props) {
    return d3.scale
      .linear()
      .domain([0, props.maxY])
      .range([props.height, 0]);
  },

  formatYAxis(ticks, maxY) {
    var formatPercent = d3.scale.linear().tickFormat(ticks, ".0%");

    return d => {
      const axisConfiguration = this.props.axisConfiguration;
      const hideMatch = axisConfiguration.y.hideMatch;
      if (hideMatch && hideMatch.test(d.toString())) {
        return "";
      }

      let value = d;

      if (axisConfiguration.y.showPercentage) {
        value = formatPercent(d / maxY);

        if (d >= maxY) {
          value = "100%";
        }
      }

      if (axisConfiguration.y.suffix) {
        value += axisConfiguration.y.suffix;
      }

      return value;
    };
  },

  renderAxis(props, xScale, yScale) {
    var length = props.width;
    var firstDataSet = props.data[0];
    if (firstDataSet != null) {
      length = firstDataSet.values.length;
    }

    // The 4 is a number that works, though random :)
    if (firstDataSet) {
      const xAxisClass = classNames("x axis", {
        "text-small": props.width < 350
      });

      var xTicks = length / (props.refreshRate / 1000) / 4;
      var xAxis = d3.svg
        .axis()
        .scale(xScale)
        .ticks(xTicks)
        .tickFormat(this.formatXAxis)
        .orient("bottom");
      d3.select(this.xAxisRef)
        .interrupt()
        .attr("class", xAxisClass)
        .call(xAxis);
    }

    const yAxisClass = classNames("y axis", {
      "text-small": props.width < 350,
      inverse: props.inverseStyle
    });
    var yAxis = d3.svg
      .axis()
      .scale(yScale)
      .ticks(props.ticksY)
      .tickFormat(this.formatYAxis(props.ticksY, props.maxY))
      .orient("left");
    d3.select(this.yAxisRef)
      .attr("class", yAxisClass)
      .call(yAxis);

    d3.select(this.yGridRef)
      .attr("class", "grid y")
      .call(
        d3.svg
          .axis()
          .scale(yScale)
          .orient("left")
          .ticks(props.ticksY)
          .tickSize(-props.width, 0, 0)
          .tickFormat("")
      );

    let xGridLines = props.ticksY;
    if (props.xGridLines != null) {
      xGridLines = props.xGridLines;
    }
    d3.select(this.xGridRef)
      .attr("class", "grid x")
      .call(
        d3.svg
          .axis()
          .scale(xScale)
          .orient("top")
          .ticks(xGridLines)
          .tickSize(-props.height, 0, 0)
          .tickFormat("")
      );
  },

  prepareValues(props) {
    var data = this.internalStorage_get();
    var stackedData = data.stack(props.data);
    var valuesLength = 0;
    var rectWidth = 0;

    if (stackedData.length !== 0) {
      valuesLength = Util.last(stackedData).values.length;
      rectWidth =
        (props.width - props.margin.left - props.margin.right) / valuesLength;
    }

    return {
      valuesLength,
      rectWidth,
      stackedData
    };
  },

  resetXAxis(props) {
    var data = this.internalStorage_get();
    // here we reset the position of the axis to what it was before the animation started
    // the axis is reset right before we update the bar to the new value/position
    // prevents subsequent animations from animating from 0
    if (data.rectWidth) {
      d3.select(this.xAxisRef)
        .interrupt()
        .transition()
        .delay(0)
        .attr("transform", "translate(" + [0, props.height] + ")");
    }
  },

  getBarList() {
    var data = this.internalStorage_get();
    var props = this.props;
    var marginLeft = props.margin.left;
    var marginRight = props.margin.right;
    var chartWidth = props.width;
    var y = props.y;
    var valuesLength = data.valuesLength;
    var posY = Array(valuesLength).fill(props.height);
    var peaklineHeight = 2;
    var lineClass;
    if (!props.peakline) {
      peaklineHeight = 0;
      lineClass = "hidden ";
    }

    return data.stackedData.map(function(service) {
      const rectWidth =
        (chartWidth - marginLeft - marginRight) / (valuesLength - 1);

      return service.values.map(function(val, j) {
        let rectHeight, colorClass;
        let barMargin = 0;
        let shapeRendering = "auto";
        const posX =
          chartWidth -
          marginLeft -
          marginRight -
          rectWidth * (valuesLength - 1 - j);

        if (val.percentage == null) {
          rectHeight = props.height - peaklineHeight;
          colorClass = "path-color-7";

          // flush svg rect edges together
          shapeRendering = "crispEdges";
        } else {
          rectHeight = (props.height * val[y]) / props.maxY - peaklineHeight;
          colorClass = `path-color-${service.colorIndex}`;

          // Will increase the margin between bars as they become smaller
          // to make it visually easier to parse
          barMargin = 1 + Math.pow(rectWidth, -0.4);
        }

        posY[j] -= rectHeight;

        return (
          <Bar
            posX={posX}
            posY={posY[j]}
            rectHeight={rectHeight}
            rectWidth={rectWidth}
            margin={barMargin}
            colorClass={colorClass}
            transitionDelay={props.transition.delay}
            transitionDuration={props.transition.duration}
            lineClass={lineClass + colorClass}
            shapeRendering={shapeRendering}
          />
        );
      });
    });
  },

  render() {
    var data = this.internalStorage_get();
    var props = this.props;
    var margin = props.margin;
    var clipPath = "url(#" + data.clipPathID + ")";

    var gridClassSet = classNames({
      "grid-graph": true,
      inverse: props.inverseStyle
    });

    return (
      <svg
        height={props.height + margin.bottom}
        width={props.width}
        className="barchart"
      >
        <g transform={"translate(" + [margin.left, margin.bottom / 2] + ")"}>
          <g className="y axis" ref={ref => (this.yAxisRef = ref)} />
          <g
            className="x axis"
            transform={"translate(" + [0, props.height] + ")"}
            ref={ref => (this.xAxisRef = ref)}
          />
          <g className={gridClassSet} clipPath={clipPath}>
            <g ref={ref => (this.yGridRef = ref)} />
            <g ref={ref => (this.xGridRef = ref)} />
            {this.getBarList()}
          </g>
        </g>
      </svg>
    );
  }
});

module.exports = BarChart;
