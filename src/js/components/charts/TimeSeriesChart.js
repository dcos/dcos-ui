import d3 from "d3";
import deepEqual from "deep-equal";
import React from "react";
import ReactDOM from "react-dom";

import AnimationCircle from "./AnimationCircle";
import ChartMixin from "../../mixins/ChartMixin";
import ChartStripes from "./ChartStripes";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";
import Maths from "../../utils/Maths";
import Rect from "./Rect";
import TimeSeriesArea from "./TimeSeriesArea";
import TimeSeriesMouseOver from "./TimeSeriesMouseOver";
import ValueTypes from "../../constants/ValueTypes";
import Util from "../../utils/Util";

var TimeSeriesChart = React.createClass({
  displayName: "TimeSeriesChart",

  propTypes: {
    axisConfiguration: React.PropTypes.object,
    // [{name: 'Area Name', values: [{date: some time, y: 0}]}]
    data: React.PropTypes.array.isRequired,
    // `height` and `width` are required if this
    // module isn't used as a child of the `Chart` component
    // Otherwise Chart will automatically calculate this.
    height: React.PropTypes.number,
    margin: React.PropTypes.object.isRequired,
    maxY: React.PropTypes.number,
    refreshRate: React.PropTypes.number.isRequired,
    ticksY: React.PropTypes.number,
    y: React.PropTypes.string,
    yFormat: React.PropTypes.string,
    width: React.PropTypes.number
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
    var props = this.props;
    var height = this.getHeight(props);
    var width = this.getWidth(props);

    this.renderAxis(props, width, height);
    this.createClipPath(width, height);
  },

  shouldComponentUpdate(nextProps) {
    var props = this.props;

    // The d3 axis helper requires a <g> element passed into do its work. This
    // happens after mount and ends up keeping the axis code outside of react
    // unfortunately.
    // If non `data` props change then we need to update the whole graph
    if (!deepEqual(Util.omit(props, "data"), Util.omit(nextProps, "data"))) {
      var height = this.getHeight(nextProps);
      var width = this.getWidth(nextProps);

      this.renderAxis(nextProps, width, height);

      return true;
    }

    // This won't be scalable if we decide to stack graphs
    var prevVal = props.data[0].values;
    var nextVal = nextProps.data[0].values;

    var prevY = prevVal.map(function(value) {
      return value[props.y];
    });
    var nextY = nextVal.map(function(value) {
      return value[props.y];
    });

    return !deepEqual(prevY, nextY);
  },

  componentDidUpdate() {
    var props = this.props;
    var height = this.getHeight(props);
    var width = this.getWidth(props);

    this.updateClipPath(width, height);
  },

  createClipPath(width, height) {
    var data = this.internalStorage_get();
    var el = this.refs.movingEls;

    // create clip path for areas and x-axis
    d3
      .select(el)
      .append("defs")
      .append("clipPath")
      .attr("id", data.clipPathID)
      .append("rect");

    this.updateClipPath(width, height);
  },

  createUnsuccessfulBlocks(data, xTimeScale) {
    const transitionTime = this.getTransitionTime(data);
    const nextY = this.getNextXPosition(data, xTimeScale, transitionTime);
    const props = this.props;
    const width = props.width / data.length;

    return data.map(function(obj) {
      if (obj[props.y] == null) {
        const x = xTimeScale(obj.date - props.refreshRate);
        const uniqueMaskID = Util.uniqueID("singleMask");

        return (
          <Rect
            width={width}
            height={props.height}
            x={x}
            y={0}
            className="unsuccessful-block"
            transitionDuration={props.refreshRate}
            transform={`translate(${-nextY}, 0)`}
            key={`${uniqueMaskID}${x}`}
          />
        );
      }
    });
  },

  updateClipPath(width, height) {
    var data = this.internalStorage_get();

    d3.select("#" + data.clipPathID + " rect").attr({
      width,
      height
    });
  },

  getArea(y, xTimeScale, yScale, firstSuccessful) {
    // We need firstSuccessful because if the current value is null,
    // we want to make it equal to the most recent successful value in order to
    // have a straight line on the graph.
    var value = firstSuccessful[y] || 0;
    var successfulValue = yScale(value);

    return d3.svg
      .area()
      .x(function(d) {
        return xTimeScale(d.date);
      })
      .y0(function() {
        return yScale(0);
      })
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
    var y = this.props.y;
    var value = firstSuccessful[y] || 0.1;
    var successfulValue = yScale(value);

    return d3.svg
      .line()
      .x(function(d) {
        return xTimeScale(d.date);
      })
      .y(function(d) {
        if (d[y] != null) {
          successfulValue = yScale(d[y] || 0.1);
        }

        return successfulValue;
      })
      .interpolate("monotone");
  },

  getXTickValues(xScale) {
    var domain = xScale.domain();
    var mean = Maths.mean(domain);

    return [domain[0], mean, domain[domain.length - 1]];
  },

  getXTimeScale(data, width) {
    var date = Date.now();
    var dateDelta = Date.now();

    var firstDataSet = data[0];
    if (firstDataSet != null) {
      var hiddenValuesCount = 1;
      var values = firstDataSet.values;
      // [first date, last date - 1]
      // Restrict x domain to have one extra point outside of graph area,
      // since we are animating the graph in from right
      date = values[0].date;
      dateDelta = values[values.length - 1 - hiddenValuesCount].date;
    }

    return d3.time.scale().range([0, width]).domain([date, dateDelta]);
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
    var maxY = props.maxY;
    var ticksY = props.ticksY;
    var yFormat = props.yFormat;

    if (yFormat === ValueTypes.PERCENTAGE) {
      var formatPercent = d3.scale
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
    var xScale = this.getXScale(props.data, width, props.refreshRate);
    var yScale = this.getYScale(height, props.maxY);

    var xAxis = d3.svg
      .axis()
      .scale(xScale)
      .tickValues(this.getXTickValues(xScale))
      .tickFormat(this.formatXAxis)
      .orient("bottom");
    d3
      .select(this.refs.xAxis)
      .interrupt()
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    var yAxis = d3.svg
      .axis()
      .scale(yScale)
      .ticks(props.ticksY)
      .tickFormat(this.formatYAxis(props))
      .orient("left");
    d3.select(this.refs.yAxis).call(yAxis);

    d3
      .select(this.refs.grid)
      .call(
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
    var l = data.length - 1;

    return (data[l].date - data[l - 1].date) / 1;
  },

  /*
   * Returns the x position of the data point that we are about to animate in
   */
  getNextXPosition(values, xTimeScale, transitionTime) {
    var firstDataSet = values[0];
    var date = Date.now();

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
    var latestDataPoint = Util.last(obj.values);

    // most recent y - height of chart
    return yScale(latestDataPoint[y]) - height;
  },

  getAreaList(props, yScale, xTimeScale) {
    var firstSuccess = props.data[0].values.find(function(stateResource) {
      return stateResource[props.y] != null;
    }) || {};
    // We need firstSuccess because if the current value is null,
    // we want to make it equal to the most recent successful value in order to
    // have a straight line on the graph.
    var area = this.getArea(props.y, xTimeScale, yScale, firstSuccess);
    var valueLine = this.getValueLine(xTimeScale, yScale, firstSuccess);

    return props.data.map((stateResource, i) => {
      var transitionTime = this.getTransitionTime(stateResource.values);
      var nextY = this.getNextXPosition(
        stateResource.values,
        xTimeScale,
        transitionTime
      );

      return (
        <TimeSeriesArea
          className={"path-color-" + stateResource.colorIndex}
          key={i}
          line={valueLine(stateResource.values)}
          path={area(stateResource.values)}
          position={[-nextY, 0]}
          transitionTime={transitionTime}
        />
      );
    });
  },

  getCircleList(props, yScale, width, height) {
    return props.data.map((obj, i) => {
      var transitionTime = this.getTransitionTime(obj.values);
      var lastObj = Util.last(obj.values);

      if (lastObj[props.y] == null) {
        return null;
      }

      var nextX = this.getNextYPosition(obj, props.y, yScale, height);

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
    var margin = props.margin;

    return function() {
      var el = ReactDOM.findDOMNode(this);
      var elPosition = el.getBoundingClientRect();

      return {
        top: elPosition.top + margin.top,
        right: elPosition.left + props.width - margin.right,
        bottom: elPosition.top + props.height - margin.bottom,
        left: elPosition.left + margin.left
      };
    }.bind(this);
  },

  addMouseHandler(handleMouseMove, handleMouseOut) {
    var el = ReactDOM.findDOMNode(this);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseout", handleMouseOut);
  },

  removeMouseHandler(handleMouseMove, handleMouseOut) {
    var el = ReactDOM.findDOMNode(this);
    el.removeEventListener("mousemove", handleMouseMove);
    el.removeEventListener("mouseout", handleMouseOut);
  },

  render() {
    var store = this.internalStorage_get();
    var props = this.props;

    var margin = props.margin;
    var height = this.getHeight(props);
    var width = this.getWidth(props);
    var xScale = this.getXScale(props.data, width, props.refreshRate);
    var xTimeScale = this.getXTimeScale(props.data, width);
    var yScale = this.getYScale(height, props.maxY);
    var clipPath = "url(#" + store.clipPathID + ")";
    var maskID = this.internalStorage_get().maskID;
    var unsuccessfulBlocks = this.createUnsuccessfulBlocks(
      props.data[0].values,
      xTimeScale
    );

    return (
      <div className="timeseries-chart">
        <svg height={props.height} width={props.width}>
          <g transform={"translate(" + margin.left + "," + margin.top + ")"}>
            <ChartStripes count={4} height={height} width={width} />
            <g className="bars grid-graph" ref="grid" />
            <g className="y axis" ref="yAxis" />
            <g className="x axis" ref="xAxis" />
            <TimeSeriesMouseOver
              addMouseHandler={this.addMouseHandler}
              data={props.data}
              getBoundingBox={this.getBoundingBox(props)}
              height={height}
              removeMouseHandler={this.removeMouseHandler}
              width={width}
              xScale={xScale}
              y={props.y}
              yCaption={this.getYCaption(props.yFormat)}
              yScale={yScale}
            />
          </g>
        </svg>

        <svg
          height={props.height}
          width={props.width}
          ref="movingEls"
          className="moving-elements"
        >
          <g transform={"translate(" + margin.left + "," + margin.top + ")"}>
            <g className="area path-color-7" clipPath={clipPath}>
              {unsuccessfulBlocks}
            </g>
            <g ref="masking" mask={`url(#${maskID})`} clipPath={clipPath}>
              {this.getAreaList(props, yScale, xTimeScale)}
            </g>
            {this.getCircleList(props, yScale, width, height)}
          </g>
          <defs>
            <mask ref="maskDef" id={store.maskID}>
              <rect x="0" y="0" width={width} height={height} fill="white" />
              {unsuccessfulBlocks}
            </mask>
          </defs>
        </svg>
      </div>
    );
  }
});

module.exports = TimeSeriesChart;
