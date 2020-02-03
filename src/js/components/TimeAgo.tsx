import PropTypes from "prop-types";
import * as React from "react";

import DateUtil from "../utils/DateUtil";

const SECOND = 1000;
const MINUTE = 60 * MINUTE;
const HOUR = 60 * HOUR;
const DAY = 24 * DAY;

export default class TimeAgo extends React.Component {
  static defaultProps = {
    autoUpdate: true,
    suppressSuffix: false
  };
  static propTypes = {
    autoUpdate: PropTypes.bool,
    className: PropTypes.string,
    prefix: PropTypes.node,
    suppressSuffix: PropTypes.bool,
    time: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
  };
  constructor(...args) {
    super(...args);

    this.state = {};

    if (this.props.autoUpdate && this.props.time) {
      this.state.interval = window.setTimeout(
        this.updateTime,
        this.getUpdateInterval()
      );
    }
  }

  componentWillUnmount() {
    if (this.state.interval) {
      window.clearInterval(this.state.interval);
    }
  }

  getUpdateInterval() {
    const timeAgo = Date.now() - new Date(this.props.time);

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
  updateTime = () => {
    this.setState({
      interval: window.setTimeout(this.updateTime, this.getUpdateInterval())
    });
  };

  render() {
    const { prefix, suppressSuffix, time } = this.props;
    let relativeTime = "N/A";
    if (time) {
      relativeTime = DateUtil.msToRelativeTime(time, suppressSuffix);
    }

    let prefixString;
    if (prefix) {
      prefixString = `${prefix} `;
    }

    return (
      <time
        className={this.props.className}
        title={DateUtil.msToUTCDate(time)}
        dateTime={DateUtil.msToUTCDate(time)}
      >
        {prefixString}
        {relativeTime}
      </time>
    );
  }
}
