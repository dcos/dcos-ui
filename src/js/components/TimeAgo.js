import React from 'react';

import DateUtil from '../utils/DateUtil';
import Util from '../utils/Util';

const SECOND = 1000;
const MINUTE = 60 * 1000;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const METHODS_TO_BIND = [
  'updateTime'
];

class TimeAgo extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.state = {};

    if (!this.props.dontUpdate && this.props.time != null) {
      this.state.interval = global.setTimeout(
        this.updateTime,
        this.getUpdateInterval()
      );
    }
  }

  componentWillUnmount() {
    if (this.state.interval) {
      global.clearInterval(this.state.interval);
    }
  }

  getUpdateInterval() {
    let timeAgo = Date.now() - new Date(this.props.time);

    if (timeAgo > DAY) {
      return DAY;
    }

    if (timeAgo > HOUR) {
      return HOUR;
    }

    if (timeAgo > MINUTE) {
      return MINUTE;
    }

    return SECOND;
  }

  updateTime() {
    this.setState({
      interval: global.setTimeout(this.updateTime, this.getUpdateInterval())
    });
  }

  render() {
    let {prefix, suppressSuffix, time} = this.props;
    let relativeTime = DateUtil.msToRelativeTime(time, suppressSuffix);
    if (time == null) {
      relativeTime = 'N/A';
    }

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
  dontUpdate: false,
  suppressSuffix: false
};

TimeAgo.propTypes = {
  dontUpdate: React.PropTypes.bool,
  prefix: React.PropTypes.node,
  suppressSuffix: React.PropTypes.bool,
  time: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.number
  ]).isRequired
};

module.exports = TimeAgo;
