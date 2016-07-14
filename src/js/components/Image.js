import React from 'react';

const METHODS_TO_BIND = ['onImageError'];

class Image extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onImageError(event) {
    let {fallbackSrc} = this.props;
    if (!fallbackSrc || event.target.src === fallbackSrc) {
      return;
    }

    event.target.src = fallbackSrc;
  }

  render() {
    let {props} = this;

    return (
      <img src={props.src} onError={this.onImageError} {...props} />
    );
  }
}

Image.propTypes = {
  src: React.PropTypes.string,
  fallbackSrc: React.PropTypes.string
};

module.exports = Image;
