var _ = require('underscore');
var d3 = require('d3');
var React = require('react');

var InternalStorageMixin = require('../mixins/InternalStorageMixin');

var AnimatedLogo = React.createClass({

  displayName: 'AnimatedLogo',

  propTypes: {
    speed: React.PropTypes.number,
    scale: React.PropTypes.number
  },

  mixins: [InternalStorageMixin],

  getDefaultProps: function () {
    return {
      speed: 1000,
      scale: 1
    };
  },

  componentWillMount: function () {
    this.internalStorage_set({
      logoGradientID: _.uniqueId('logoGradient'),
      intervalID: null,
      calcBrezierLine: d3.svg.line()
        .x(function (d) { return d[0]; })
        .y(function (d) { return d[1]; })
        .interpolate('basis')
    });
  },

  componentDidMount: function () {
    this.startAnimationLoop();
  },

  componentWillUnmount: function () {
    this.stopAnimationLoop();
  },

  startAnimationLoop: function () {
    this.stopAnimationLoop();

    this.animateTriangles();
    var intervalID = setInterval(this.animateTriangles, this.props.speed);
    this.internalStorage_update({intervalID: intervalID});
  },

  stopAnimationLoop: function () {
    var data = this.internalStorage_get();

    if (data.intervalID) {
      window.clearInterval(data.intervalID);
    }
  },

  getGradientStyles: function () {
    return {
      start: {
        stopColor: 'rgb(147,81,229)',
        stopOpacity: '1'
      },
      stop: {
        stopColor: 'rgb(239,70,139)',
        stopOpacity: '1'
      }
    };
  },

  animateTriangles: function () {
    var speed = this.props.speed;

    d3.select(this.refs.center)
      .transition()
      .ease('in-out')
      .duration(speed)
      .attr('d', this.getTrianglePosition('center', _.random(180, 280)));

    d3.select(this.refs.left)
      .transition()
      .ease('in-out')
      .duration(speed)
      .attr('d', this.getTrianglePosition('left', _.random(160, 240)));

    d3.select(this.refs.right)
      .transition()
      .ease('in-out')
      .duration(speed)
      .attr('d', this.getTrianglePosition('right', _.random(140, 195)));
  },

  getTrianglePosition: function (position, constant) {
    var data = this.internalStorage_get();
    var pad = 10;

    if (position === 'center') {
      if (!constant) {
        constant = 280;
      }

      return data.calcBrezierLine([
        [20, 25],
        [190, constant],
        // Curve coordinates
        [190 + 5, constant + 5],
        [190 + 25, constant - 20],

        [378 + 5, pad],
        [378, 15],
        // Curve coordinates
        [378, pad],

        [35, pad],
        [pad, pad],
        // Curve coordinates
        [20, 28]
      ]);
    } else if (position === 'left') {
      if (!constant) {
        constant = 240;
      }

      return data.calcBrezierLine([
        [pad, 25],
        [pad, constant],
        // Curve coordinates
        [pad, constant],

        [378, 15],
        // Curve coordinates
        [378, pad],

        [25, pad],
        // Curve coordinates
        [pad, pad],
        [pad, 30]
      ]);
    } else if (position === 'right') {
      if (!constant) {
        constant = 195;
      }

      return data.calcBrezierLine([
        [383, 25],
        [383, constant],
        // Curve coordinates
        [383, constant],

        [15, 15],
        // Curve coordinates
        [pad, pad],

        [358, pad],
        // Curve coordinates
        [383, pad],
        [383, 30]
      ]);
    }
  },

  buildTriangles: function (strokeID) {
    return _.map(['center', 'right', 'left'], function (position) {
      return (
        <path ref={position}
          key={position}
          d={this.getTrianglePosition(position)}
          fill="transparent"
          stroke={strokeID}
          strokeWidth="17"/>
      );
    }, this);
  },

  render: function () {
    var data = this.internalStorage_get();
    var props = this.props;

    var scaleFunction = 'scale(' + props.scale + ')';
    var svgStyle = {
      msTransform: scaleFunction,
      WebkitTransform: scaleFunction,
      transform: scaleFunction
    };
    var gradientStyles = this.getGradientStyles();

    var strokeID = 'url(#' + data.logoGradientID + ')';
    var triangles = this.buildTriangles(strokeID);

    return (
      <div className="text-align-center">
        <svg width="400" height="300" version="1.1" xmlns="http://www.w3.org/2000/svg" style={svgStyle}>
            <defs>
              <linearGradient id={data.logoGradientID} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={gradientStyles.start} />
                <stop offset="100%" style={gradientStyles.stop} />
              </linearGradient>
            </defs>

            {triangles}
        </svg>
      </div>
    );
  }
});

module.exports = AnimatedLogo;
