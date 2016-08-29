import classNames from 'classnames/dedupe';
import React from 'react';

/*
 * Example usage:
 * <Loader className="inverse" type="ballSpinFadeLoader" />
 */

// Available types:
let typeMap = {
  ballBeat: {className: 'ball-beat', divCount: 3},
  ballClipRotate: {className: 'ball-clip-rotate', divCount: 1},
  ballClipRotateMultiple:
    {className: 'ball-clip-rotate-multiple', divCount: 2},
  ballClipRotatePulse: {className: 'ball-clip-rotate-pulse', divCount: 2},
  ballGridBeat: {className: 'ball-grid-beat', divCount: 9},
  ballGridPulse: {className: 'ball-grid-pulse', divCount: 9},
  ballPulseRise: {className: 'ball-pulse-rise', divCount: 5},
  ballPulseSync: {className: 'ball-pulse-sync', divCount: 3},
  ballRotate: {className: 'ball-rotate', divCount: 1},
  ballScale: {className: 'ball-scale', divCount: 1},
  ballScaleMultiple: {className: 'ball-scale-multiple', divCount: 3},
  ballScaleRandom: {className: 'ball-scale-random', divCount: 3},
  ballScaleRipple: {className: 'ball-scale-ripple', divCount: 1},
  ballScaleRippleMultiple:
    {className: 'ball-scale-ripple-multiple', divCount: 3},
  ballSpinFadeLoader: {className: 'ball-spin-fade-loader', divCount: 8},
  ballTrianglePath: {className: 'ball-triangle-path', divCount: 3},
  ballZigZag: {className: 'ball-zig-zag', divCount: 2},
  ballZigZagDeflect: {className: 'ball-zig-zag-deflect', divCount: 2},
  cubeTransition: {className: 'cube-transition', divCount: 2},
  lineScale: {className: 'line-scale', divCount: 5},
  lineScaleParty: {className: 'line-scale-party', divCount: 4},
  lineScalePulseOut: {className: 'line-scale-pulse-out', divCount: 5},
  lineScalePulseOutRapid:
    {className: 'line-scale-pulse-out-rapid', divCount: 5},
  lineSpinFadeLoader: {className: 'line-spin-fade-loader', divCount: 8},
  pacman: {className: 'pacman', divCount: 5},
  semiCircleSpin: {className: 'semi-circle-spin', divCount: 1},
  triangleSkewSpin: {className: 'triangle-skew-spin', divCount: 1}
};

class Loader extends React.Component {
  getDivs(length) {
    return Array.from({length}).map(function (_, index) {
      return <div key={index} />;
    });
  }

  render() {
    let {className, innerClassName, type} = this.props;
    let config = typeMap[type] || typeMap.ballScale;
    let classes = classNames(
      'loader horizontal-center vertical-center',
      className
    );

    let innerClasses = classNames(config.className, innerClassName);

    return (
      <div className={classes}>
        <div className={innerClasses}>
          {this.getDivs(config.divCount)}
        </div>
      </div>
    );
  }
}

Loader.defaultProps = {
  className: '',
  innerClassName: ''
};

let classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

Loader.propTypes = {
  className: classPropType,
  innerClassName: classPropType
};

module.exports = Loader;
