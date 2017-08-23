/* @flow */
import React from "react";
import ReactDOM from "react-dom";

const PropTypes = React.PropTypes;

type Props = {
  width?: number,
  height?: number,
  x?: number,
  y?: number,
  fill?: string,
  className?: string,
  transitionDuration?: number,
  transform?: string,
  key?: any
};

class Rect extends React.Component {

  componentDidMount() {
    this.transitionRect(this.props);
  }

  componentWillUpdate(nextProps) {
    this.transitionRect(nextProps);
  }

  transitionRect(props) {
    const { transitionDuration, transform } = props;
    const el = ReactDOM.findDOMNode(this);

    d3
      .select(el)
      .transition()
      .duration(transitionDuration)
      .ease("linear")
      .attr("transform", transform);
  }

  render() {
    const { width, height, x, y, fill, className } = this.props;

    return (
      <rect
        width={width}
        height={height}
        x={x}
        y={y}
        fill={fill}
        className={className}
      />
    );
  }
}

module.exports = Rect;
