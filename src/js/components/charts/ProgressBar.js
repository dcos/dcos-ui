import React from 'react';

import InternalStorageMixin from '../../mixins/InternalStorageMixin';

var ProgressBar = React.createClass({

  displayName: 'ProgressBar',

  mixins: [InternalStorageMixin],

  propTypes: {
    colorIndex: React.PropTypes.number,
    value: React.PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      colorIndex: 1,
      value: 0
    };
  },

  /**
   * for animation purposes we want to always start at 0
   * then update the values when we receive props.
   **/
  componentWillMount() {
    this.internalStorage_set({value: 0});
  },

  componentDidMount() {
    this.internalStorage_set({value: this.props.value});
    this.forceUpdate();
  },

  componentWillReceiveProps(nextProps) {
    this.internalStorage_set({value: nextProps.value});
  },

  render() {
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
