import classNames from "classnames/dedupe";
import React from "react";

/*
 * Example usage:
 * <Loader type="ballSpinFadeLoader" />
 */

// Available types:
const typeMap = {
  ballBeat: { className: "ball-beat", divCount: 3 },
  ballScale: { className: "ball-scale", divCount: 1 },
  ballSpinFadeLoader: { className: "ball-spin-fade-loader", divCount: 8 }

  /* Other available loaders: */
  // ballClipRotate: {className: 'ball-clip-rotate', divCount: 1},
  // ballClipRotateMultiple:
  //   {className: 'ball-clip-rotate-multiple', divCount: 2},
  // ballClipRotatePulse: {className: 'ball-clip-rotate-pulse', divCount: 2},
  // ballGridBeat: {className: 'ball-grid-beat', divCount: 9},
  // ballGridPulse: {className: 'ball-grid-pulse', divCount: 9},
  // ballPulseRise: {className: 'ball-pulse-rise', divCount: 5},
  // ballPulseSync: {className: 'ball-pulse-sync', divCount: 3},
  // ballRotate: {className: 'ball-rotate', divCount: 1},
  // ballScaleMultiple: {className: 'ball-scale-multiple', divCount: 3},
  // ballScaleRandom: {className: 'ball-scale-random', divCount: 3},
  // ballScaleRipple: {className: 'ball-scale-ripple', divCount: 1},
  // ballScaleRippleMultiple:
  //   {className: 'ball-scale-ripple-multiple', divCount: 3},
  // ballTrianglePath: {className: 'ball-triangle-path', divCount: 3},
  // ballZigZag: {className: 'ball-zig-zag', divCount: 2},
  // ballZigZagDeflect: {className: 'ball-zig-zag-deflect', divCount: 2},
  // cubeTransition: {className: 'cube-transition', divCount: 2},
  // lineScale: {className: 'line-scale', divCount: 5},
  // lineScaleParty: {className: 'line-scale-party', divCount: 4},
  // lineScalePulseOut: {className: 'line-scale-pulse-out', divCount: 5},
  // lineScalePulseOutRapid:
  //   {className: 'line-scale-pulse-out-rapid', divCount: 5},
  // lineSpinFadeLoader: {className: 'line-spin-fade-loader', divCount: 8},
  // pacman: {className: 'pacman', divCount: 5},
  // semiCircleSpin: {className: 'semi-circle-spin', divCount: 1},
  // triangleSkewSpin: {className: 'triangle-skew-spin', divCount: 1}
};

class Loader extends React.Component {
  getDivs(length) {
    return Array.from({ length }).map(function(_, index) {
      return <div className="loader-element" key={index} />;
    });
  }

  render() {
    const { className, innerClassName, size, type } = this.props;
    const config = typeMap[type] || typeMap.ballScale;
    const classes = classNames("loader horizontal-center", className);

    const innerClasses = classNames(
      config.className,
      {
        "loader-small": size === "small"
      },
      innerClassName
    );

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
  className: "",
  innerClassName: "",
  type: "ballScale"
};

const classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

Loader.propTypes = {
  className: classPropType,
  innerClassName: classPropType,
  size: React.PropTypes.oneOf(["small"]),
  type: React.PropTypes.oneOf(["ballBeat", "ballScale", "ballSpinFadeLoader"])
};

module.exports = Loader;
