var _ = require('underscore');
var classNames = require('classnames');
var d3 = require('d3');
var React = require('react');
var ReactDOM = require('react-dom');

var Bar = require('./Bar');
var ChartMixin = require('../../mixins/ChartMixin');
import DOMUtils from '../../utils/DOMUtils';
var InternalStorageMixin = require('../../mixins/InternalStorageMixin');

var BarChart = React.createClass({

  displayName: 'BarChart',

  mixins: [ChartMixin, InternalStorageMixin],

  propTypes: {
    axisConfiguration: React.PropTypes.object,
    data: React.PropTypes.array.isRequired,
    // `height` and `width` are required if this
    // module isn't used as a child of the `Chart` component
    // Otherwise Chart will automatically calculate this.
    height: React.PropTypes.number,
    inverseStyle: React.PropTypes.bool,
    peakline: React.PropTypes.bool,
    refreshRate: React.PropTypes.number.isRequired,
    y: React.PropTypes.string,
    width: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      axisConfiguration: {
        x: {hideMatch: false},
        y: {hideMatch: false, showPercentage: true}
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
      y: 'y'
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return (this.props.height !== nextProps.height ||
      this.props.width !== nextProps.width ||
      !_.isEqual(this.props.data, nextProps.data)) &&
      DOMUtils.isElementOnTop(ReactDOM.findDOMNode(this));
  },

  componentWillMount: function () {
    var props = this.props;

    var width = this.getWidth(props);
    var xScale = this.getXScale(props.data, width, props.refreshRate);
    var yScale = this.getYScale(props);

    var data = {
      stack: this.getStack(),
      xScale,
      yScale,
      clipPathID: _.uniqueId('clip')
    };

    this.internalStorage_set(data);

    // #prepareValues needs data.stack, so we must set that first
    this.internalStorage_update(this.prepareValues(this.props));
  },

  componentDidMount: function () {
    var data = this.internalStorage_get();
    var props = this.props;

    this.renderAxis(props, data.xScale, data.yScale);
    this.createClipPath();
    this.resetXAxis(props);
  },

  componentWillReceiveProps: function (props) {
    var width = this.getWidth(props);
    var xScale = this.getXScale(props.data, width, props.refreshRate);
    var yScale = this.getYScale(props);
    // the d3 axis helper requires a <g> element passed into do its work. This
    // happens after mount and ends up keeping the axis code outside of react
    // unfortunately.
    this.renderAxis(props, xScale, yScale);

    this.internalStorage_update(_.extend(this.prepareValues(props), {
      xScale: xScale,
      yScale: yScale
    }));

    this.resetXAxis(props);
  },

  componentDidUpdate: function () {
    this.updateClipPath();
  },

  createClipPath: function () {
    var data = this.internalStorage_get();
    var el = ReactDOM.findDOMNode(this);

    d3.select(el)
      .append('defs')
      .append('clipPath')
        .attr('id', data.clipPathID)
        .append('rect');

    this.updateClipPath();
  },

  updateClipPath: function () {
    var data = this.internalStorage_get();
    var props = this.props;
    var width = props.width - props.margin.left - props.margin.right;
    var height = props.height + 1;  // +1 for the base axis line

    d3.select('#' + data.clipPathID + ' rect')
      .attr({
        width: width,
        height: height
      });
  },

  getStack: function () {
    return d3.layout.stack()
      .values(function (d) { return d.values; })
      .x(function (d) { return d.date; });
  },

  getYScale: function (props) {
    return d3.scale.linear()
      .domain([0, props.maxY])
      .range([props.height, 0]);
  },

  formatYAxis: function (ticks, maxY) {
    var formatPercent = d3.scale.linear().tickFormat(ticks, '.0%');
    return (d) => {
      let axisConfiguration = this.props.axisConfiguration;
      let hideMatch = axisConfiguration.y.hideMatch;
      if (hideMatch && hideMatch.test(d.toString())) {
        return '';
      }

      let value = d;

      if (axisConfiguration.y.showPercentage) {
        value = formatPercent(d / maxY);

        if (d >= maxY) {
          value = '100%';
        }
      }

      if (axisConfiguration.y.suffix) {
        value += axisConfiguration.y.suffix;
      }

      return value;
    };
  },

  renderAxis: function (props, xScale, yScale) {
    var length = props.width;
    var firstDataSet = _.first(props.data);
    if (firstDataSet != null) {
      length = firstDataSet.values.length;
    }

    // The 4 is a number that works, though random :)
    if (firstDataSet) {
      let xAxisClass = classNames('x axis', {
        'text-small': props.width < 350
      });

      var xTicks = length / (props.refreshRate / 1000) / 4;
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(xTicks)
        .tickFormat(this.formatXAxis)
        .orient('bottom');
      d3.select(this.refs.xAxis).interrupt()
        .attr('class', xAxisClass)
        .call(xAxis);
    }

    let yAxisClass = classNames('y axis', {
      'text-small': props.width < 350,
      'inverse': props.inverseStyle
    });
    var yAxis = d3.svg.axis()
      .scale(yScale)
      .ticks(props.ticksY)
      .tickFormat(this.formatYAxis(props.ticksY, props.maxY))
      .orient('left');
    d3.select(this.refs.yAxis)
      .attr('class', yAxisClass)
      .call(yAxis);

    d3.select(this.refs.yGrid)
      .attr('class', 'grid y')
      .call(
        d3.svg.axis().scale(yScale)
          .orient('left')
          .ticks(props.ticksY)
          .tickSize(-props.width, 0, 0)
          .tickFormat('')
      );

    let xGridLines = props.ticksY;
    if (props.xGridLines != null) {
      xGridLines = props.xGridLines;
    }
    d3.select(this.refs.xGrid)
      .attr('class', 'grid x')
      .call(
        d3.svg.axis().scale(xScale)
          .orient('top')
          .ticks(xGridLines)
          .tickSize(-props.height, 0, 0)
          .tickFormat('')
      );
  },

  prepareValues: function (props) {
    var data = this.internalStorage_get();
    var stackedData = data.stack(props.data);
    var valuesLength = 0;
    var rectWidth = 0;

    if (stackedData.length !== 0) {
      valuesLength = _.last(stackedData).values.length;
      rectWidth = (props.width - props.margin.left - props.margin.right) / valuesLength;
    }

    return {
      valuesLength: valuesLength,
      rectWidth: rectWidth,
      stackedData: stackedData
    };
  },

  resetXAxis: function (props) {
    var data = this.internalStorage_get();
    // here we reset the position of the axis to what it was before the animation started
    // the axis is reset right before we update the bar to the new value/position
    // prevents subsequent animations from animating from 0
    if (data.rectWidth) {
      d3.select(this.refs.xAxis).interrupt()
        .transition().delay(0)
        .attr('transform', 'translate(' + [0, props.height] + ')');
    }
  },

  getBarList: function () {
    var data = this.internalStorage_get();
    var props = this.props;
    var marginLeft = props.margin.left;
    var marginRight = props.margin.right;
    var chartWidth = props.width;
    var y = props.y;
    var valuesLength = data.valuesLength;
    var posY = _.map(_.range(valuesLength), function () {
      return props.height;
    });
    var peaklineHeight = 2;
    var lineClass;
    if (!props.peakline) {
      peaklineHeight = 0;
      lineClass = 'hidden ';
    }

    return _.map(data.stackedData, function (service) {
      let rectWidth = (chartWidth - marginLeft - marginRight) / (valuesLength - 1);

      return _.map(service.values, function (val, j) {
        let rectHeight, colorClass;
        let barMargin = 0;
        let shapeRendering = 'auto';
        let posX = chartWidth - marginLeft - marginRight - rectWidth * (valuesLength - 1 - j);

        if (val.percentage == null) {
          rectHeight = props.height - peaklineHeight;
          colorClass = 'path-color-7';

          // flush svg rect edges together
          shapeRendering = 'crispEdges';
        } else {
          rectHeight = props.height * val[y] / props.maxY - peaklineHeight;
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
            shapeRendering={shapeRendering} />
        );
      });
    });
  },

  render: function () {
    var data = this.internalStorage_get();
    var props = this.props;
    var margin = props.margin;
    var clipPath = 'url(#' + data.clipPathID + ')';

    var gridClassSet = classNames({
      'grid-graph': true,
      inverse: props.inverseStyle
    });

    return (
      <svg height={props.height + margin.bottom}
          width={props.width}
          className="barchart"
          ref="barchart">
        <g transform={'translate(' + [margin.left, margin.bottom / 2] + ')'}>
          <g className="y axis" ref="yAxis" />
          <g className="x axis"
            transform={'translate(' + [0, props.height] + ')'}
            ref="xAxis"/>
          <g className={gridClassSet} clipPath={clipPath}>
            <g ref="yGrid" />
            <g ref="xGrid" />
            {this.getBarList()}
          </g>
        </g>
      </svg>
    );
  }
});

module.exports = BarChart;
