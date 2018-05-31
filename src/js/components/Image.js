import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";

const METHODS_TO_BIND = ["onImageError"];

class Image extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      imageErrorCount: 0
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { src, fallbackSrc } = this.props;
    let newSrc;
    if (src !== nextProps.src) {
      newSrc = nextProps.src;
    }

    if (src === nextProps.src && fallbackSrc !== nextProps.fallbackSrc) {
      newSrc = nextProps.fallbackSrc;
    }

    // Try again if a new url was provided
    if (newSrc) {
      const image = ReactDOM.findDOMNode(this);
      image.src = newSrc;
      this.setState({ imageErrorCount: 0 });
    }
  }

  onImageError(event) {
    const {
      props: { fallbackSrc },
      state: { imageErrorCount }
    } = this;

    if (imageErrorCount === 0) {
      event.target.src = fallbackSrc;
    }

    // Both src and fallback failed
    this.setState({ imageErrorCount: imageErrorCount + 1 });
  }

  render() {
    const {
      props,
      state: { imageErrorCount }
    } = this;
    const classes = classNames(
      { hidden: imageErrorCount > 1 },
      props.className
    );

    return (
      <img src={props.src} className={classes} onError={this.onImageError} />
    );
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string,

  // Classes
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

module.exports = Image;
