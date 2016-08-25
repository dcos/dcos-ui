import React from 'react';
import classNames from 'classnames/dedupe';

// Size of largest portion to give to smallest portion. We have a max of 5
// status types so we want to keep this growth ratio relatively small.
const GROW_RATIO = 0.07;
// Grow anything below this threshold by stealing from the biggest portion
const MIN_SIZE = 7; // (% of statusBar width)

function stealPortion(barSizes, indexesLessThanThreshold, unassignedPortion) {
  if (!indexesLessThanThreshold.length) {
    return;
  }
  // Try to steal some width from the largest portion
  // and give it to the first portion in indexesLessThanThreshold
  let maxSize = 0;
  let maxIndex = 0;
  // Find new Max (could be different after we've stolen from a portion already)
  barSizes.forEach(function (relativeSize, index) {
    if (relativeSize > maxSize) {
      maxSize = relativeSize;
      maxIndex = index;
    }
  });
  // Possible we have unassigned portion that we should steal from first
  if (unassignedPortion > maxSize) {
    maxSize = unassignedPortion;
    maxIndex = -1;
  }

  let currentGrowthIndex = indexesLessThanThreshold[0];
  let sizeToSteal = maxSize * GROW_RATIO;
  // Reassign the portion
  barSizes[currentGrowthIndex] += sizeToSteal;
  if (maxIndex > -1) {
    barSizes[maxIndex] -= sizeToSteal;
  } else {
    unassignedPortion -= sizeToSteal;
  }

  if (barSizes[currentGrowthIndex] > MIN_SIZE) {
    // Done with growing this portion. Otherwise it stays on the stack
    // and will get another % added to it from the largest portion
    // calculated in the next iteration.
    indexesLessThanThreshold = indexesLessThanThreshold.slice(1);
  }
  // Recurse till we have grown everything above threshold
  stealPortion(barSizes, indexesLessThanThreshold, unassignedPortion);
}

class StatusBar extends React.Component {
  getBars(data) {
    let max = data.reduce(function (sum, item) {
      return sum + item.value;
    }, 0);
    let unassignedValue = this.props.scale - max;

    max = Math.max(this.props.scale, max);

    if (max === 0) {
      return null;
    }
    let indexesLessThanThreshold = [];
    let unassignedPortion = unassignedValue / max * 100;

    let barSizes = data.map(function (status, index) {
      let {value} = status;

      let relativeSize = value / max * 100;

      if (relativeSize > 0 && relativeSize < MIN_SIZE) {
        indexesLessThanThreshold.push(index);
      }

      return relativeSize;
    });

    // Fudge barSizes to ensure small portions are visible
    stealPortion(barSizes, indexesLessThanThreshold, unassignedPortion);

    return data.map(function (status, index) {
      let {className, style = {}} = status;
      let scale = barSizes[index];

      if (className == null) {
        className = `element-${index}`;
      }

      className = classNames('bar', className);

      if (scale === 0) {
        return null;
      }

      style.width = `${scale}%`;

      return (
        <span style={style} key={index} className={className} />
      );
    });
  }

  render() {
    let {data, className} = this.props;

    if (!data) {
      return null;
    }

    let classes = classNames('status-bar flex-box', className);

    return (
      <div className={classes}>{this.getBars(data)}</div>
    );
  }
}

StatusBar.defaultProps = {
  scale: 0
};

StatusBar.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  scale: React.PropTypes.number,
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      className: React.PropTypes.string,
      value: React.PropTypes.number.isRequired
    })
  ).isRequired
};

module.exports = StatusBar;
