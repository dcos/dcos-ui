import React from 'react';

import DateUtil from '../utils/DateUtil';
import Util from '../utils/Util';

class TimeAgo extends React.Component {
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
  suppressSuffix: false
};

TimeAgo.propTypes = {
  prefix: React.PropTypes.node,
  suppressSuffix: React.PropTypes.bool,
  time: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.number
  ])
};

module.exports = TimeAgo;
