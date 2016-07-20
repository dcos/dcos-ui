import React from 'react';

import DateUtil from '../utils/DateUtil';
import Util from '../utils/Util';

const METHODS_TO_BIND = [
  'updateTime'
];

class TimeAgo extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.state = {
      interval: global.setInterval(this.updateTime, this.props.updateInterval)
    };
  }

  componentWillUnmount() {
    global.clearInterval(this.state.interval);
  }

  updateTime() {
    this.forceUpdate();
  }

  render() {
    let {prefix, suppressSuffix, time} = this.props;
    let relativeTime = DateUtil.msToRelativeTime(time, suppressSuffix);
    let prefixString;
    if (prefix) {
      prefixString = `${prefix} `;
    }

    return (
      <time
        title={DateUtil.msToDateStr(time)}
        dateTime={DateUtil.msToDateStr(time)}
        {...Util.omit(this.props, ['prefix', 'suppressSuffix', 'time'])}>
        {prefixString}{relativeTime}
      </time>
    );
  }
}

TimeAgo.defaultProps = {
  suppressSuffix: false,
  // Update every 30 seconds
  updateInterval: 1000 * 30
};

TimeAgo.propTypes = {
  prefix: React.PropTypes.node,
  suppressSuffix: React.PropTypes.bool,
  time: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.number
  ]).isRequired
};

module.exports = TimeAgo;
