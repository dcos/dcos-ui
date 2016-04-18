var d3 = require('d3');
var React = require('react');
var ReactDOM = require('react-dom');

var TimeSeriesArea = React.createClass({

  displayName: 'TimeSeriesArea',

  propTypes: {
    className: React.PropTypes.string,
    line: React.PropTypes.string.isRequired,
    path: React.PropTypes.string.isRequired,
    position: React.PropTypes.array.isRequired,
    transitionTime: React.PropTypes.number.isRequired
  },

  componentDidMount: function () {
    var props = this.props;

    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(props.transitionTime)
      .ease('linear')
      .attr('transform', 'translate(' + props.position + ')');
  },

  componentWillReceiveProps: function (props) {
    d3.select(ReactDOM.findDOMNode(this)).interrupt()
      .attr('transform', null)
      .transition()
      .duration(props.transitionTime)
      .ease('linear')
      .attr('transform', 'translate(' + props.position + ')');
  },

  render: function () {
    var className = this.props.className;

    return (
      <g>
        <path className={'area ' + className} d={this.props.path} />
        <path className={'line ' + className} d={this.props.line} />
      </g>
    );
  }
});

module.exports = TimeSeriesArea;
