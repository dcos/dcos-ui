import PropTypes from "prop-types";
import * as React from "react";
import createReactClass from "create-react-class";

const ChartStripes = createReactClass({
  displayName: "ChartStripes",

  propTypes: {
    count: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  },

  getStripes(props) {
    const count = props.count;
    const width = props.width / (2 * count);

    return Array(count)
      .fill()
      .map((v, i) => {
        // indent with margin, start one width length in
        // and add two times width per step
        const position = width + i * 2 * width;

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
    return <g>{this.getStripes(this.props)}</g>;
  },
});

export default ChartStripes;
