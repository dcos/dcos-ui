import React from "react";
import ImageViewerModal from "./modals/ImageViewerModal";

const METHODS_TO_BIND = [
  "handleImageViewerModalClose",
  "handleImageViewerLeftClick",
  "handleImageViewerRightClick"
];

class ImageViewer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { selectedImage: null };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleImageViewerModalClose() {
    this.setState({ selectedImage: null });
  }

  handleImageViewerModalOpen(selectedImage) {
    this.setState({ selectedImage });
  }

  handleImageViewerLeftClick() {
    let { selectedImage } = this.state;
    const { images } = this.props;
    if (--selectedImage < 0) {
      selectedImage = images.length - 1;
    }
    this.setState({ selectedImage });
  }

  handleImageViewerRightClick() {
    let { selectedImage } = this.state;
    const { images } = this.props;
    // Add before the modulus operator and use modulus as a circular buffer
    this.setState({ selectedImage: ++selectedImage % images.length });
  }

  getImages(images) {
    return images.map((imageUrl, index) => {
      return (
        <div className="media-object-item media-object-item-fill" key={index}>
          <div
            className="media-object-item-fill-image image-rounded-corners clickable"
            onClick={this.handleImageViewerModalOpen.bind(this, index)}
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
      );
    });
  }

  render() {
    const { images } = this.props;
    const { selectedImage } = this.state;

    if (!images || !images.length) {
      return null;
    }

    return (
      <div className="pod pod-short flush-top flush-right flush-left">
        <h5 className="flush-top">Media</h5>
        <div className="media-object-spacing-wrapper media-object-offset">
          <div className="media-object flex-box flex-box-wrap">
            {this.getImages(images)}
          </div>
        </div>
        <ImageViewerModal
          onLeftClick={this.handleImageViewerLeftClick}
          onRightClick={this.handleImageViewerRightClick}
          images={images}
          open={selectedImage != null}
          onClose={this.handleImageViewerModalClose}
          selectedImage={selectedImage}
        />
      </div>
    );
  }
}

ImageViewer.defaultProps = {
  images: []
};

ImageViewer.propTypes = {
  images: React.PropTypes.arrayOf(React.PropTypes.string)
};

module.exports = ImageViewer;
