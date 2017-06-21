import React from "react";
import ReactDOM from "react-dom";

const PropTypes = React.PropTypes;

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

Rect.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  fill: PropTypes.string,
  className: PropTypes.string,
  transitionDuration: PropTypes.number,
  transform: PropTypes.string,
  key: PropTypes.any
};

module.exports = Rect;
