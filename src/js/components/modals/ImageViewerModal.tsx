import classNames from "classnames";
import { Modal } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  iconSizeS,
  white,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import keyCodes from "../../utils/KeyboardUtil";

class ImageViewerModal extends React.Component {
  static defaultProps = {
    images: [],
  };
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.string),
    onLeftClick: PropTypes.func.isRequired,
    onRightClick: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  state = { isLoadingImage: false };

  constructor(...args) {
    super(...args);

    if (this.props.open) {
      window.addEventListener("keydown", this.handleKeyPress, true);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (props.open && !nextProps.open) {
      // Closes
      window.removeEventListener("keydown", this.handleKeyPress, true);
    }

    if (!props.open && nextProps.open) {
      // Opens
      window.addEventListener("keydown", this.handleKeyPress, true);
    }
  }
  handleKeyPress = (event) => {
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
  };
  handleClick = (direction) => {
    if (direction === "left") {
      this.props.onLeftClick();
    }

    if (direction === "right") {
      this.props.onRightClick();
    }

    this.handleLoadingImageChange(true);
  };

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
          <span className="arrow">
            <Icon
              color={white}
              shape={SystemIcons.CaretLeft}
              size={iconSizeS}
            />
          </span>
        </span>
        <span
          className="modal-image-viewer-arrow-container clickable forward"
          onClick={this.handleClick.bind(this, "left")}
        >
          <span className="arrow">
            <Icon
              color={white}
              shape={SystemIcons.CaretRight}
              size={iconSizeS}
            />
          </span>
        </span>
      </div>
    );
  }

  render() {
    const { props, state } = this;
    const closeIcon = <Icon shape={SystemIcons.Close} size={iconSizeXs} />;
    const modalClasses = classNames("modal modal-image-viewer", {
      hidden: state.isLoadingImage,
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

export default ImageViewerModal;
