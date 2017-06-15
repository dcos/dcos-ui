import d3 from "d3";
import React from "react";
import ReactDOM from "react-dom";

var Bar = React.createClass({
  displayName: "Bar",

  propTypes: {
    posX: React.PropTypes.number.isRequired,
    posY: React.PropTypes.number.isRequired,
    rectHeight: React.PropTypes.number.isRequired,
    rectWidth: React.PropTypes.number.isRequired,
    colorClass: React.PropTypes.string.isRequired,
    lineClass: React.PropTypes.string.isRequired
  },

  componentDidMount() {
    this.animate(this.props);
  },

  componentWillUpdate() {
    if (!this.props.transitionDelay && !this.props.transitionDuration) {
      return;
    }

    // here we reset the position of the bar to what it was before the animation started
    // the bar is reset right before we update the bar to the new value
    const el = ReactDOM.findDOMNode(this);
    d3
      .select(el)
      .interrupt()
      .transition()
      .duration(0)
      .attr("transform", "translate(" + this.props.posX + ")");
  },

  componentDidUpdate(props) {
    this.animate(props);
  },

  animate(props) {
    if (!props.transitionDelay && !props.transitionDuration) {
      return;
    }
    const el = ReactDOM.findDOMNode(this);
    d3
      .select(el)
      .interrupt()
      .transition()
      .delay(props.transitionDelay)
      .duration(props.transitionDuration)
      .ease("linear")
      .attr("transform", "translate(" + (props.posX - props.rectWidth) + ")");
  },

  render() {
    var props = this.props;
    var posY = props.posY || 0;
    // Show 1px height when value is 0, to not confuse user with an empty graph
    var rectHeight = props.rectHeight || 1;
    var rectWidth = props.rectWidth || 0;

    return (
      <g className="bar" transform={"translate(" + [props.posX, 0] + ")"}>
        <line
          className={props.lineClass}
          x1={0}
          y1={posY}
          x2={rectWidth - props.margin}
          y2={posY}
        />
        <rect
          shape-rendering={props.shapeRendering}
          className={props.colorClass}
          y={posY}
          height={rectHeight}
          width={rectWidth - props.margin}
        />
      </g>
    );
  }
});

module.exports = Bar;
