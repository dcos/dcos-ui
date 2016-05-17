import React from 'react';

import StackedProgressBar from './StackedProgressBar';

class SegmentedProgressBar extends React.Component {
  getSegment(segment, index) {
    return (
      <StackedProgressBar className={this.props.stackedProgressBarClassName}
        progressState={segment.upgradeState} key={index}
        secondaryLabel={segment.label} />
    );
  }

  render() {
    let props = this.props;
    let segments = props.segments.map(
      (segment, index) => this.getSegment(segment, index)
    );

    return (
      <div className={props.className}>
        <div className={props.titleClassName}>
          <em className="emphasize">{props.primaryTitle}</em>: {props.secondaryTitle}
        </div>
        <div className={props.segmentsClassName}>
          {segments}
        </div>
      </div>
    );
  }
}

SegmentedProgressBar.defaultProps = {
  className: 'segmented-progress-bar',
  segmentsClassName: 'segmented-progress-bar-segments',
  titleClassName: 'segmented-progress-bar-title'
};

SegmentedProgressBar.propTypes = {
  className: React.PropTypes.string,
  primaryTitle: React.PropTypes.node,
  secondaryTitle: React.PropTypes.node,
  segments: React.PropTypes.array.isRequired,
  segmentsClassName: React.PropTypes.string,
  stackedProgressBarClassName: React.PropTypes.string,
  titleClassName: React.PropTypes.string
};

module.exports = SegmentedProgressBar;
