import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";
import ImageViewerModal from "./modals/ImageViewerModal";

class ImageViewer extends React.Component {
  static defaultProps = {
    images: []
  };
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.string)
  };
  constructor(...args) {
    super(...args);

    this.state = { selectedImage: null };
  }
  handleImageViewerModalClose = () => {
    this.setState({ selectedImage: null });
  };

  handleImageViewerModalOpen(selectedImage) {
    this.setState({ selectedImage });
  }
  handleImageViewerLeftClick = () => {
    let { selectedImage } = this.state;
    const { images } = this.props;
    if (--selectedImage < 0) {
      selectedImage = images.length - 1;
    }
    this.setState({ selectedImage });
  };
  handleImageViewerRightClick = () => {
    let { selectedImage } = this.state;
    const { images } = this.props;
    // Add before the modulus operator and use modulus as a circular buffer
    this.setState({ selectedImage: ++selectedImage % images.length });
  };

  getImages(images) {
    return images.map((imageUrl, index) => (
      <div className="media-object-item media-object-item-fill" key={index}>
        <div
          className="media-object-item-fill-image image-rounded-corners clickable"
          onClick={this.handleImageViewerModalOpen.bind(this, index)}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </div>
    ));
  }

  render() {
    const { images } = this.props;
    const { selectedImage } = this.state;

    if (!images || !images.length) {
      return null;
    }

    return (
      <div className="pod pod-short flush-top flush-right flush-left">
        <Trans render="h2">Media</Trans>
        <div className="media-object-spacing-wrapper media-object-offset">
          <div className="media-object media-object-wrap">
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

export default ImageViewer;
