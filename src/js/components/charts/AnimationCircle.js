import d3 from "d3";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import ReactDOM from "react-dom";

const AnimationCircle = createReactClass({
  displayName: "AnimationCircle",

  propTypes: {
    className: PropTypes.string,
    transitionTime: PropTypes.number.isRequired,
    position: PropTypes.array.isRequired,
    radius: PropTypes.number,
    cx: PropTypes.number,
    cy: PropTypes.number
  },

  getInitialState() {
    return {
      didRenderBefore: false
    };
  },
  getDefaultProps() {
    return {
      radius: 4,
      cx: 0,
      cy: 0
    };
  },

  componentDidMount() {
    d3.select(ReactDOM.findDOMNode(this)).attr(
      "transform",
      "translate(" + this.props.position + ")"
    );
  },

  componentWillReceiveProps(nextProps) {
    const node = ReactDOM.findDOMNode(this);

    // Handle first position to not animate into position
    // We need this because we get 0-data for graphs on the first render
    if (!this.state.didRenderBefore) {
      d3.select(node).attr(
        "transform",
        "translate(" + nextProps.position + ")"
      );

      this.setState({ didRenderBefore: true });

      return;
    }

    d3.select(node)
      .transition()
      .duration(nextProps.transitionTime)
      .ease("linear")
      .attr("transform", "translate(" + nextProps.position + ")");
  },

  render() {
    var props = this.props;
    var radius = props.radius;
    var className = props.className;

    return (
      <circle className={className} r={radius} cx={props.cx} cy={props.cy} />
    );
  }
});

export default AnimationCircle;
