import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import React from 'react';

import Icon from '../Icon';
import {keyCodes} from '../../utils/KeyboardUtil';

const METHODS_TO_BIND = [
  'handleClick',
  'handleKeyPress'
];

class ImageViewerModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {isLoadingImage: false};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    if (this.props.open) {
      global.window.addEventListener('keydown', this.handleKeyPress, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    let {props} = this;
    if (props.open && !nextProps.open) {
      // Closes
      global.window.removeEventListener('keydown', this.handleKeyPress, true);
    }

    if (!props.open && nextProps.open) {
      // Opens
      global.window.addEventListener('keydown', this.handleKeyPress, true);
    }
  }

  handleKeyPress(event) {
    let {images} = this.props;
    // Should do nothing if the key event was already consumed, or there is only
    // one or no images
    if (event.defaultPrevented || !images || images.length < 2) {
      return;
    }

    if (event.keyCode === keyCodes.leftArrow) {
      this.handleClick('left');
    }

    if (event.keyCode === keyCodes.rightArrow) {
      this.handleClick('right');
    }

    // Consume the event for suppressing "double action".
    event.preventDefault();
  }

  handleClick(direction) {
    if (direction === 'left') {
      this.props.onLeftClick();
    }

    if (direction === 'right') {
      this.props.onRightClick();
    }

    this.handleLoadingImageChange(true);
  }

  handleLoadingImageChange(isLoadingImage) {
    this.setState({isLoadingImage});
  }

  getSelectedImage() {
    let {props} = this;

    return (
      <div className="fill-image-contianer">
        <img
          className="fill-image"
          onLoad={this.handleLoadingImageChange.bind(this, false)}
           key={props.selectedImage}
          src={props.images[props.selectedImage]} />
      </div>
    );
  }

  getFooter() {
    return (
      <div onKeyPress={this.handleKeyPress}>
        <span
          onClick={this.handleClick.bind(this, 'left')}
          className="clickable arrow-container">
          <Icon
            className="arrow"
            color="white"
            family="small"
            id="caret-left"
            size="small" />
        </span>
        <span
          className="clickable arrow-container forward"
          onClick={this.handleClick.bind(this, 'left')}>
          <Icon
            className="arrow"
            color="white"
            family="small"
            id="caret-right"
            size="small" />
        </span>
      </div>
    );
  }

  render() {
    let {props, state} = this;
    let modalClasses = classNames('modal modal-image-viewer', {
      hidden: state.isLoadingImage
    });

    return (
      <Modal
        footer={this.getFooter()}
        maxHeightPercentage={0.9}
        modalClass={modalClasses}
        onClose={props.onClose}
        open={props.open}
        scrollContainerClass=""
        showCloseButton={true}
        showFooter={props.images && props.images.length > 1}
        showHeader={true}
        useGemini={false}>
        {this.getSelectedImage()}
      </Modal>
    );
  }
}

ImageViewerModal.defaultProps = {
  images: []
};

ImageViewerModal.propTypes = {
  images: React.PropTypes.arrayOf(React.PropTypes.string),
  onLeftClick: React.PropTypes.func.isRequired,
  onRightClick: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired
};

module.exports = ImageViewerModal;
