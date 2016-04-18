import ServiceImages from '../constants/ServiceImages';


const ServiceUtil = {
  getImageSizeFromImagesObject(images, size) {
    if (images == null ||
      images[`icon-${size}`] == null ||
      images[`icon-${size}`].length === 0) {
      return null;
    }

    return images[`icon-${size}`];
  },

  /**
   * Get service icon images from images object
   * @param  {Object} images containing urls for the different image sizes
   * @return {Object}        containing urls for images. Returns default images
   * if all is not available in given object.
   */
  getServiceImages(images) {
    if (this.getImageSizeFromImagesObject(images, 'small') == null ||
      this.getImageSizeFromImagesObject(images, 'medium') == null ||
      this.getImageSizeFromImagesObject(images, 'large') == null) {
      return ServiceImages.NA_IMAGES;
    }

    return images;
  }
};

module.exports = ServiceUtil;
