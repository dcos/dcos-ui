import React from 'react';
import classNames from 'classnames';

class StatusBar extends React.Component {
  static get defaultProps() {
    return {
      className: 'progress-bar flex-box upgrade-progress-bar status-bar',
      scale: null
    };
  }

  getBars(data) {
    let max = data.reduce(function (sum, item) {
      return sum + item.value;
    }, 0);
    max = Math.max(this.props.scale, max);

    if (max === 0) {
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

      let width = value / max * 100;

      let style = {
        width: `${width}%`,
        height: '100%'
      };

      return (
        <div style={style} key={index} className={className}></div>
      );
    });
  }

  render() {
    let {data, className} = this.props;

    if (!data) {
      return null;
    }

    return (
      <div className={className}>{this.getBars(data)}</div>
    );
  }
}

StatusBar.propTypes = {
  className: React.PropTypes.string,
  scale: React.PropTypes.number,
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      className: React.PropTypes.string,
      value: React.PropTypes.number.isRequired
    })
  ).isRequired
};

module.exports = StatusBar;
