import d3 from "d3";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import ReactDOM from "react-dom";

var TimeSeriesArea = createReactClass({
  displayName: "TimeSeriesArea",

  propTypes: {
    className: PropTypes.string,
    line: PropTypes.string.isRequired,
    unavailableLine: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    position: PropTypes.array.isRequired,
    transitionTime: PropTypes.number.isRequired
  },

  componentDidMount() {
    var props = this.props;

    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(props.transitionTime)
      .ease("linear")
      .attr("transform", "translate(" + props.position + ")");
  },

  componentWillReceiveProps(props) {
    d3.select(ReactDOM.findDOMNode(this))
      .interrupt()
      .attr("transform", null)
      .transition()
      .duration(props.transitionTime)
      .ease("linear")
      .attr("transform", "translate(" + props.position + ")");
  },

  render() {
    var className = this.props.className;

    return (
      <g>
        <path className={"area " + className} d={this.props.path} />
        <path
          className={"line " + className}
          stroke-linecap="butt"
          d={this.props.line}
        />
        <path
          className={"line line-unavailable " + className}
          stroke-dasharray="2,1"
          stroke-linecap="butt"
          d={this.props.unavailableLine}
        />
      </g>
    );
  }
});

module.exports = TimeSeriesArea;
