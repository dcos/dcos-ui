var React = require('react');

var InternalStorageMixin = require('../../mixins/InternalStorageMixin');

var ProgressBar = React.createClass({

  displayName: 'ProgressBar',

  mixins: [InternalStorageMixin],

  propTypes: {
    colorIndex: React.PropTypes.number,
    value: React.PropTypes.number.isRequired
  },

  getDefaultProps: function () {
    return {
      colorIndex: 1,
      value: 0
    };
  },

  /**
   * for animation purposes we want to always start at 0
   * then update the values when we receive props.
   **/
  componentWillMount: function () {
    this.internalStorage_set({value: 0});
  },

  componentDidMount: function () {
    this.internalStorage_set({value: this.props.value});
    this.forceUpdate();
  },

  componentWillReceiveProps: function (nextProps) {
    this.internalStorage_set({value: nextProps.value});
  },

  render: function () {
    var props = this.props;
    var data = this.internalStorage_get();

    return (
      <div className="progress-bar">
        <div key="bar" ref="bar"
          className={'bar color-' + props.colorIndex}
          style={{transform: `scaleX(${data.value / 100})`}} />
      </div>
    );
  }
});

module.exports = ProgressBar;
