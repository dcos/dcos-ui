var d3 = require('d3');
var React = require('react');
var ReactDOM = require('react-dom');

var AnitmationCircle = React.createClass({

  displayName: 'AnitmationCircle',

  propTypes: {
    className: React.PropTypes.string,
    transitionTime: React.PropTypes.number.isRequired,
    position: React.PropTypes.array.isRequired,
    radius: React.PropTypes.number,
    cx: React.PropTypes.number,
    cy: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      radius: 4,
      cx: 0,
      cy: 0
    };
  },

  componentDidMount: function () {
    d3.select(ReactDOM.findDOMNode(this))
      .attr('transform', 'translate(' + this.props.position + ')');
  },

  componentWillReceiveProps: function (props) {
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(props.transitionTime)
      .ease('linear')
      .attr('transform', 'translate(' + props.position + ')');
  },

  render: function () {
    var props = this.props;
    var radius = props.radius;
    var className = props.className;

    return (
      <circle className={className} r={radius} cx={props.cx} cy={props.cy} />
    );
  }
});

module.exports = AnitmationCircle;
