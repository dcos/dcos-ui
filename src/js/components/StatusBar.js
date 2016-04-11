import React from 'react';

/**
 * Usage:
 * <StatusBar
 *   height={20}
 *   data={[
 *    {
 *      key: '#FFF',
 *      value: 20,
 *      className: 'status'
 *    }, {
 *      key: '#000',
 *      value: 30,
 *      className: 'failed'
 *    }
 *  ]} />
 */
class StatusBar extends React.Component {
  constructor() {
    super(...arguments);
  }

  static get defaultProps() {
    return {
      className: 'status-bar',
      height: 10
    };
  }

  getBars(total) {
    let offset = 0;
    return function (status, index) {
      let {value, className} = status;
      if (!className) {
        className = `element-${index}`;
      }
      let width = value / total * 100;
      let bar = (
        <rect
          x={offset}
          y="0"
          key={index}
          height="100%"
          width={width}
          className={className} />
      );
      offset += width;
      return bar;
    };
  }

  render() {
    let {height, data, className} = this.props;
    if (!data) {
      return null;
    }
    let total = data.reduce(function (sum, item) {
      return sum + item.value;
    }, 0);

    data = data.map(this.getBars(total));

    return (
      <svg
        className={className}
        preserveAspectRatio="none"
        viewBox={`0 0 100 10`}
        height={height} >
        {data}
      </svg>
    );
  }
}

StatusBar.propTypes = {
  className: React.PropTypes.string,
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      className: React.PropTypes.string,
      value: React.PropTypes.number.isRequired
    })
  ).isRequired,
  height: React.PropTypes.number
};

module.exports = StatusBar;
