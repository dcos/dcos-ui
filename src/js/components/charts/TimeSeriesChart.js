import d3 from "d3";
import isEqual from "lodash.isequal";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import ReactDOM from "react-dom";

import AnimationCircle from "./AnimationCircle";
import ChartMixin from "../../mixins/ChartMixin";
import ChartStripes from "./ChartStripes";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";
import Maths from "../../utils/Maths";
import TimeSeriesArea from "./TimeSeriesArea";
import TimeSeriesMouseOver from "./TimeSeriesMouseOver";
import ValueTypes from "../../constants/ValueTypes";
import Util from "../../utils/Util";

const TimeSeriesChart = createReactClass({
  displayName: "TimeSeriesChart",

  propTypes: {
    axisConfiguration: PropTypes.object,
    // [{name: 'Area Name', values: [{date: some time, y: 0}]}]
    data: PropTypes.array.isRequired,
    // `height` and `width` are required if this
    // module isn't used as a child of the `Chart` component
    // Otherwise Chart will automatically calculate this.
    height: PropTypes.number,
    margin: PropTypes.object.isRequired,
    maxY: PropTypes.number,
    refreshRate: PropTypes.number.isRequired,
    ticksY: PropTypes.number,
    y: PropTypes.string,
    yFormat: PropTypes.string,
    width: PropTypes.number
  },

  mixins: [ChartMixin, InternalStorageMixin],

  getDefaultProps() {
    return {
      axisConfiguration: {
        x: {
          showZeroTick: true
        }
      },
      margin: {
        top: 10,
        left: 45,
        bottom: 25,
        right: 5
      },
      maxY: 10,
      refreshRate: 0,
      ticksY: 3,
      y: "y",
      yFormat: ValueTypes.PERCENTAGE
    };
  },

  componentWillMount() {
    this.internalStorage_set({
      clipPathID: `clip-${Util.uniqueID()}`,
      maskID: `mask-${Util.uniqueID()}`
    });
  },

  componentDidMount() {
    const props = this.props;
    const height = this.getHeight(props);
    const width = this.getWidth(props);

    this.renderAxis(props, width, height);
    this.createClipPath(width, height);
  },

  shouldComponentUpdate(nextProps) {
    const props = this.props;

    // The d3 axis helper requires a <g> element passed into do its work. This
    // happens after mount and ends up keeping the axis code outside of react
    // unfortunately.
    // If non `data` props change then we need to update the whole graph
    if (!isEqual(Util.omit(props, "data"), Util.omit(nextProps, "data"))) {
      const height = this.getHeight(nextProps);
      const width = this.getWidth(nextProps);

      this.renderAxis(nextProps, width, height);

      return true;
    }

    // This won't be scalable if we decide to stack graphs
    const prevVal = props.data[0].values;
    const nextVal = nextProps.data[0].values;

    const prevY = prevVal.map(function(value) {
      return value[props.y];
    });
    const nextY = nextVal.map(function(value) {
      return value[props.y];
    });

    return !isEqual(prevY, nextY);
  },

  componentDidUpdate() {
    const props = this.props;
    const height = this.getHeight(props);
    const width = this.getWidth(props);

    this.updateClipPath(width, height);
  },

  createClipPath(width, height) {
    const data = this.internalStorage_get();
    const el = this.movingElsRef;

    // create clip path for areas and x-axis
    d3.select(el)
      .append("defs")
      .append("clipPath")
      .attr("id", data.clipPathID)
      .append("rect");

    this.updateClipPath(width, height);
  },

  updateClipPath(width, height) {
    const data = this.internalStorage_get();

    d3.select("#" + data.clipPathID + " rect").attr({
      width,
      height
    });
  },

  getArea(y, xTimeScale, yScale, firstSuccessful) {
    // We need firstSuccessful because if the current value is null,
    // we want to make it equal to the most recent successful value in order to
    // have a straight line on the graph.
    const value = firstSuccessful[y] || 0;
    let successfulValue = yScale(value);

    return d3.svg
      .area()
      .x(d => xTimeScale(d.date))
      .y0(() => yScale(0))
      .y1(function(d) {
        if (d[y] != null) {
          successfulValue = yScale(d[y]);
        }

        return successfulValue;
      })
      .interpolate("monotone");
  },

  getValueLine(xTimeScale, yScale, firstSuccessful) {
    // We need firstSuccessful because if the current value is null,
    // we want to make it equal to the most recent successful value in order to
    // have a straight line on the graph.
    const y = this.props.y;
    const value = firstSuccessful[y] || 0.1;
    let successfulValue = yScale(value);

    return d3.svg
      .line()
      .defined(d => d[y] != null)
      .x(d => xTimeScale(d.date))
      .y(function(d) {
        if (d[y] != null) {
          successfulValue = yScale(d[y] || 0.1);
        }

        return successfulValue;
      })
      .interpolate("monotone");
  },

  getUnavailableLine(xTimeScale, yScale, firstSuccessful) {
    // We need firstSuccessful because if the current value is null,
    // we want to make it equal to the most recent successful value in order to
    // have a straight line on the graph.
    const y = this.props.y;
    const value = firstSuccessful[y] || 0.1;
    let successfulValue = yScale(value);

    return d3.svg
      .line()
      .x(d => xTimeScale(d.date))
      .y(function(d) {
        if (d[y] != null) {
          successfulValue = yScale(d[y] || 0.1);
        }

        return successfulValue;
      })
      .interpolate("monotone");
  },

  getXTickValues(xScale) {
    const domain = xScale.domain();
    const mean = Maths.mean(domain);

    return [domain[0], mean, domain[domain.length - 1]];
  },

  getXTimeScale(data, width) {
    let date = Date.now();
    let dateDelta = Date.now();

    const firstDataSet = data[0];
    if (firstDataSet != null) {
      const hiddenValuesCount = 1;
      const values = firstDataSet.values;
      // [first date, last date - 1]
      // Restrict x domain to have one extra point outside of graph area,
      // since we are animating the graph in from right
      date = values[0].date;
      dateDelta = values[values.length - 1 - hiddenValuesCount].date;
    }

    return d3.time
      .scale()
      .range([0, width])
      .domain([date, dateDelta]);
  },

  getYScale(height, maxY) {
    return (
      d3.scale
        .linear()
        // give a little space in the top for the number
        .range([height, 0])
        .domain([0, maxY])
    );
  },

  getYCaption(yFormat) {
    if (yFormat === ValueTypes.PERCENTAGE) {
      return "%";
    }

    return "";
  },

  formatYAxis(props) {
    const maxY = props.maxY;
    const ticksY = props.ticksY;
    const yFormat = props.yFormat;

    if (yFormat === ValueTypes.PERCENTAGE) {
      const formatPercent = d3.scale
        .linear()
        .tickFormat(ticksY, ".0" + this.getYCaption(yFormat));

      return function(d) {
        if (d >= maxY) {
          return "100%";
        }

        return formatPercent(d / maxY);
      };
    }

    return function(d) {
      if (d >= maxY) {
        return maxY;
      }

      return d;
    };
  },

  renderAxis(props, width, height) {
    const xScale = this.getXScale(props.data, width, props.refreshRate);
    const yScale = this.getYScale(height, props.maxY);

    const xAxis = d3.svg
      .axis()
      .scale(xScale)
      .tickValues(this.getXTickValues(xScale))
      .tickFormat(this.formatXAxis)
      .orient("bottom");
    d3.select(this.xAxisRef)
      .interrupt()
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    const yAxis = d3.svg
      .axis()
      .scale(yScale)
      .ticks(props.ticksY)
      .tickFormat(this.formatYAxis(props))
      .orient("left");
    d3.select(this.yAxisRef).call(yAxis);

    d3.select(this.gridRef).call(
      d3.svg
        .axis()
        .scale(yScale)
        .orient("left")
        .ticks(props.ticksY)
        .tickSize(-width, 0, 0)
        .tickFormat("")
    );
  },

  getTransitionTime(data) {
    // look at the difference between the last and the third last point
    // to calculate transition time
    const l = data.length - 1;

    return (data[l].date - data[l - 1].date) / 1;
  },

  /*
   * Returns the x position of the data point that we are about to animate in
   */
  getNextXPosition(values, xTimeScale, transitionTime) {
    const firstDataSet = values[0];
    let date = Date.now();

    if (firstDataSet != null) {
      date = firstDataSet.date;
    }

    // add transition time since we are moving towards new pos
    return xTimeScale(date + transitionTime);
  },

  /*
   * Returns the y position of the data point that we are about to animate in
   */
  getNextYPosition(obj, y, yScale, height) {
    const latestDataPoint = Util.last(obj.values);

    // most recent y - height of chart
    return yScale(latestDataPoint[y]) - height;
  },

  getAreaList(props, yScale, xTimeScale) {
    const firstSuccess =
      props.data[0].values.find(
        stateResource => stateResource[props.y] != null
      ) || {};
    // We need firstSuccess because if the current value is null,
    // we want to make it equal to the most recent successful value in order to
    // have a straight line on the graph.
    const area = this.getArea(props.y, xTimeScale, yScale, firstSuccess);
    const valueLine = this.getValueLine(xTimeScale, yScale, firstSuccess);
    const unavailableLine = this.getUnavailableLine(
      xTimeScale,
      yScale,
      firstSuccess
    );

    return props.data.map((stateResource, i) => {
      const transitionTime = this.getTransitionTime(stateResource.values);
      const nextY = this.getNextXPosition(
        stateResource.values,
        xTimeScale,
        transitionTime
      );

      return (
        <TimeSeriesArea
          className={"path-color-" + stateResource.colorIndex}
          key={i}
          line={valueLine(stateResource.values)}
          unavailableLine={unavailableLine(stateResource.values)}
          path={area(stateResource.values)}
          position={[-nextY, 0]}
          transitionTime={transitionTime}
        />
      );
    });
  },

  getCircleList(props, yScale, width, height) {
    return props.data.map((obj, i) => {
      const transitionTime = this.getTransitionTime(obj.values);
      const lastObj = Util.last(obj.values);

      if (lastObj[props.y] == null) {
        return null;
      }

      const nextX = this.getNextYPosition(obj, props.y, yScale, height);

      return (
        <AnimationCircle
          className={"arc path-color-" + obj.colorIndex}
          cx={width}
          cy={height}
          key={i}
          position={[0, nextX]}
          transitionTime={transitionTime}
        />
      );
    });
  },

  getBoundingBox(props) {
    const margin = props.margin;

    return function() {
      const el = ReactDOM.findDOMNode(this);
      const elPosition = el.getBoundingClientRect();

      return {
        top: elPosition.top + margin.top,
        right: elPosition.left + props.width - margin.right,
        bottom: elPosition.top + props.height - margin.bottom,
        left: elPosition.left + margin.left
      };
    }.bind(this);
  },

  addMouseHandler(handleMouseMove, handleMouseOut) {
    const el = ReactDOM.findDOMNode(this);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseout", handleMouseOut);
  },

  removeMouseHandler(handleMouseMove, handleMouseOut) {
    const el = ReactDOM.findDOMNode(this);
    el.removeEventListener("mousemove", handleMouseMove);
    el.removeEventListener("mouseout", handleMouseOut);
  },

  render() {
    const {
      data,
      height,
      margin,
      maxY,
      refreshRate,
      width,
      yFormat,
      y
    } = this.props;
    const store = this.internalStorage_get();
    const stripeHeight = this.getHeight(this.props);
    const stripeWidth = this.getWidth(this.props);
    const xScale = this.getXScale(data, stripeWidth, refreshRate);
    const xTimeScale = this.getXTimeScale(data, stripeWidth);
    const yScale = this.getYScale(stripeHeight, maxY);
    const clipPath = "url(#" + store.clipPathID + ")";
    const maskID = this.internalStorage_get().maskID;

    return (
      <div className="timeseries-chart">
        <svg height={height} width={width}>
          <g transform={"translate(" + margin.left + "," + margin.top + ")"}>
            <ChartStripes count={4} height={stripeHeight} width={stripeWidth} />
            <g className="bars grid-graph" ref={ref => (this.gridRef = ref)} />
            <g className="y axis" ref={ref => (this.yAxisRef = ref)} />
            <g className="x axis" ref={ref => (this.xAxisRef = ref)} />
            <TimeSeriesMouseOver
              addMouseHandler={this.addMouseHandler}
              data={this.props.data}
              getBoundingBox={this.getBoundingBox(this.props)}
              height={stripeHeight}
              removeMouseHandler={this.removeMouseHandler}
              width={stripeWidth}
              xScale={xScale}
              y={y}
              yCaption={this.getYCaption(yFormat)}
              yScale={yScale}
            />
          </g>
        </svg>

        <svg
          height={height}
          width={width}
          ref={ref => (this.movingElsRef = ref)}
          className="moving-elements"
        >
          <g transform={"translate(" + margin.left + "," + margin.top + ")"}>
            <g mask={`url(#${maskID})`} clipPath={clipPath}>
              {this.getAreaList(this.props, yScale, xTimeScale)}
            </g>
            {this.getCircleList(this.props, yScale, stripeWidth, stripeHeight)}
          </g>
        </svg>
      </div>
    );
  }
});

module.exports = TimeSeriesChart;
