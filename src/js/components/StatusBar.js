import React from 'react';

import classNames from 'classnames';

class StatusBar extends React.Component {
  constructor() {
    super(...arguments);
  }

  static get defaultProps() {
    return {
      className: 'progress-bar',
      total: 0
    };
  }

  getBars(data) {
    let total = data.reduce(function (sum, item) {
      return sum + item.value;
    }, 0);
    let offset = 0;
    total = Math.max(this.props.total, total);
    if (total === 0) {
      return null;
    }

    return data.map(function (status, index) {
      let {value, className} = status;
      if (className == null) {

        className = `element-${index}`;
      }
      className = classNames(className, 'bar');
      if (value === 0) {
        return null;
      }

      let width = value / total * 100;

      let style = {
        width: `${width}%`,
        height: '100%'
      };
      let bar = (
        <div
          style={style}
          key={index}
          className={className}></div>
      );
      offset += width;
      return bar;
    });
  }

  render() {
    let {data, className} = this.props;
    if (!data) {
      return null;
    }
    className = classNames(className, 'flex-box upgrade-progress-bar' +
      ' status-bar');
    return (
      <div
        className={className}>
        {this.getBars(data)}
      </div>
    );
  }
}

StatusBar.propTypes = {
  className: React.PropTypes.string,
  total: React.PropTypes.number,
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      className: React.PropTypes.string,
      value: React.PropTypes.number.isRequired
    })
  ).isRequired
};

module.exports = StatusBar;
