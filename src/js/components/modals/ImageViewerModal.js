import classNames from "classnames";
import { Modal } from "reactjs-components";
import React from "react";

import Icon from "../Icon";
import { keyCodes } from "../../utils/KeyboardUtil";

const METHODS_TO_BIND = ["handleClick", "handleKeyPress"];

class ImageViewerModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { isLoadingImage: false };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    if (this.props.open) {
      global.addEventListener("keydown", this.handleKeyPress, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (props.open && !nextProps.open) {
      // Closes
      global.removeEventListener("keydown", this.handleKeyPress, true);
    }

    if (!props.open && nextProps.open) {
      // Opens
      global.addEventListener("keydown", this.handleKeyPress, true);
    }
  }

  handleKeyPress(event) {
    const { images } = this.props;
    // Should do nothing if the key event was already consumed, or there is only
    // one or no images
    if (event.defaultPrevented || !images || images.length < 2) {
      return;
    }

    if (event.keyCode === keyCodes.leftArrow) {
      this.handleClick("left");
    }

    if (event.keyCode === keyCodes.rightArrow) {
      this.handleClick("right");
    }

    // Consume the event for suppressing "double action".
    event.preventDefault();
  }

  handleClick(direction) {
    if (direction === "left") {
      this.props.onLeftClick();
    }

    if (direction === "right") {
      this.props.onRightClick();
    }

    this.handleLoadingImageChange(true);
  }

  handleLoadingImageChange(isLoadingImage) {
    this.setState({ isLoadingImage });
  }

  getSelectedImage() {
    const { props } = this;

    return (
      <div className="fill-image-container">
        <img
          className="fill-image"
          onLoad={this.handleLoadingImageChange.bind(this, false)}
          key={props.selectedImage}
          src={props.images[props.selectedImage]}
        />
      </div>
    );
  }

  getFooter() {
    return (
      <div onKeyPress={this.handleKeyPress}>
        <span
          onClick={this.handleClick.bind(this, "left")}
          className="modal-image-viewer-arrow-container clickable backward"
        >
          <Icon className="arrow" color="white" id="caret-left" size="small" />
        </span>
        <span
          className="modal-image-viewer-arrow-container clickable forward"
          onClick={this.handleClick.bind(this, "left")}
        >
          <Icon className="arrow" color="white" id="caret-right" size="small" />
        </span>
      </div>
    );
  }

  render() {
    const { props, state } = this;
    const closeIcon = <Icon id="close" size="mini" />;
    const modalClasses = classNames("modal modal-image-viewer", {
      hidden: state.isLoadingImage
    });

    return (
      <Modal
        footer={this.getFooter()}
        modalClass={modalClasses}
        onClose={props.onClose}
        open={props.open}
        scrollContainerClass=""
        closeButton={closeIcon}
        showFooter={props.images && props.images.length > 1}
        showHeader={false}
        useGemini={false}
      >
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
