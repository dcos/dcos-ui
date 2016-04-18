var d3 = require('d3');
var React = require('react');
import ReactDOM from 'react-dom';

var Bar = React.createClass({

  displayName: 'Bar',

  propTypes: {
    posX: React.PropTypes.number.isRequired,
    posY: React.PropTypes.number.isRequired,
    rectHeight: React.PropTypes.number.isRequired,
    rectWidth: React.PropTypes.number.isRequired,
    colorClass: React.PropTypes.string.isRequired,
    lineClass: React.PropTypes.string.isRequired
  },

  componentDidMount: function () {
    this.animate(this.props);
  },

  componentWillUpdate: function () {
    if (!this.props.transitionDelay && !this.props.transitionDuration) {
      return;
    }

    // here we reset the position of the bar to what it was before the animation started
    // the bar is reset right before we update the bar to the new value
    let el = ReactDOM.findDOMNode(this);
    d3.select(el).interrupt()
      .transition()
      .duration(0)
      .attr('transform', 'translate(' + this.props.posX + ')');
  },

  componentDidUpdate: function (props) {
    this.animate(props);
  },

  animate: function (props) {
    if (!props.transitionDelay && !props.transitionDuration) {
      return;
    }
    let el = ReactDOM.findDOMNode(this);
    d3.select(el).interrupt()
      .transition()
        .delay(props.transitionDelay)
        .duration(props.transitionDuration)
        .ease('linear')
        .attr('transform', 'translate(' + (props.posX - props.rectWidth) + ')');
  },

  render: function () {
    var props = this.props;
    var posY = props.posY || 0;
    var rectWidth = props.rectWidth || 0;

    return (
      <g className="bar"
          transform={'translate(' + [props.posX, 0] + ')'}>
        <line
            className={props.lineClass}
            x1={0}
            y1={posY}
            x2={rectWidth - props.margin}
            y2={posY} />
        <rect
            shape-rendering={props.shapeRendering}
            className={props.colorClass}
            y={posY}
            height={props.rectHeight || 0}
            width={rectWidth - props.margin} />
      </g>
    );
  }
});

module.exports = Bar;
