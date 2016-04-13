import React from 'react';

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

  getBars(data) {
    let total = data.reduce(function (sum, item) {
      return sum + item.value;
    }, 0);
    let offset = 0;

    return data.map(function (status, index) {
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
    });
  }

  render() {
    let {data, className} = this.props;
    if (!data) {
      return null;
    }

    return (
      <svg
        className={className}
        preserveAspectRatio="none">
        {this.getBars(data)}
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
