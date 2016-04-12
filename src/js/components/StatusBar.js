import React from 'react';

/**
 * Status bar component creates a segmented bar based on the data input
 * @example
 * <StatusBar
 *   data={[
 *    {
 *      value: 20,
 *      className: 'status'
 *    }, {
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

  getBarsFunction(total) {
    let offset = 0;
    return function (status, index) {
      let {value, className} = status;
      if (!className) {
        className = `element-${index}`;
      }
      let width = value / total * 100;
      let bar = (
        <rect
          x={`${offset}%`}
          y="0"
          key={index}
          height="100%"
          width={`${width}%`}
          className={className} />
      );
      offset += width;
      return bar;
    };
  }

  render() {
    let {data, className} = this.props;
    if (!data) {
      return null;
    }
    let total = data.reduce(function (sum, item) {
      return sum + item.value;
    }, 0);

    return (
      <svg
        className={className}
        preserveAspectRatio="none">
        {data.map(this.getBarsFunction(total))}
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
  ).isRequired
};

module.exports = StatusBar;
