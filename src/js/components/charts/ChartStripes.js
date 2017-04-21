import React from "react";

var ChartStripes = React.createClass({
  displayName: "ChartStripes",

  propTypes: {
    count: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired
  },

  getStripes(props) {
    var count = props.count;
    var width = props.width / (2 * count);

    return Array(count).fill().map(function(v, i) {
      // indent with margin, start one width length in
      // and add two times width per step
      var position = width + i * 2 * width;

      return (
        <rect
          key={i}
          className="background"
          x={position + "px"}
          y={0}
          height={props.height}
          width={width}
        />
      );
    });
  },

  render() {
    return (
      <g>
        {this.getStripes(this.props)}
      </g>
    );
  }
});

module.exports = ChartStripes;
