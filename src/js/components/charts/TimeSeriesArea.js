import d3 from "d3";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";

export default class TimeSeriesArea extends React.Component {
  componentDidMount() {
    var props = this.props;

    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(props.transitionTime)
      .ease("linear")
      .attr("transform", "translate(" + props.position + ")");
  }

  componentWillReceiveProps(props) {
    d3.select(ReactDOM.findDOMNode(this))
      .interrupt()
      .attr("transform", null)
      .transition()
      .duration(props.transitionTime)
      .ease("linear")
      .attr("transform", "translate(" + props.position + ")");
  }

  render() {
    const { className } = this.props;

    return (
      <g>
        <path className={"area " + className} d={this.props.path} />
        <path
          className={"line " + className}
          strokeLinecap="butt"
          d={this.props.line}
        />
        <path
          className={"line line-unavailable " + className}
          strokeDasharray="2,1"
          strokeLinecap="butt"
          d={this.props.unavailableLine}
        />
      </g>
    );
  }
}

TimeSeriesArea.displayName = "TimeSeriesArea";

TimeSeriesArea.propTypes = {
  className: PropTypes.string,
  line: PropTypes.string.isRequired,
  unavailableLine: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  position: PropTypes.array.isRequired,
  transitionTime: PropTypes.number.isRequired
};
