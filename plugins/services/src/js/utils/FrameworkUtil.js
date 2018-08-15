import Util from "#SRC/js/utils/Util";
import RouterUtil from "#SRC/js/utils/RouterUtil";

import ServiceImages from "../constants/ServiceImages";

// You might be tempted to merge FrameworkUtil into ServiceUtil, but that will
// cause a circular dependency with ServiceUtil and struct/Service.
const FrameworkUtil = {
  getImageSizeFromImagesObject(images, size) {
    if (
      images == null ||
      images[`icon-${size}`] == null ||
      images[`icon-${size}`].length === 0
    ) {
      return null;
    }

    return images[`icon-${size}`];
  },

  /**
   * Get meta data from framework labels
   * @param {{DCOS_PACKAGE_METADATA:string}} labels
   * @returns {object} metadata
   */
  getMetadataFromLabels(labels) {
    if (
      Util.findNestedPropertyInObject(labels, "DCOS_PACKAGE_METADATA.length") ==
      null
    ) {
      return {};
    }

    // Extract content of the DCOS_PACKAGE_METADATA label
    try {
      const dataAsJsonString = global.atob(labels.DCOS_PACKAGE_METADATA);

      return JSON.parse(dataAsJsonString);
    } catch (error) {
      return {};
    }
  },

  /**
   * Get service icon images from images object
   * @param  {Object} packageImages containing urls for the different image sizes
   * @return {Object}               containing urls from the extracted query string
   * if all is not available in given object.
   */
  extractImageUrls(packageImages) {
    const images = Object.assign({}, packageImages);

    Object.keys(images).forEach(image => {
      const queryString = images[image].substring(
        images[image].lastIndexOf("?")
      );
      images[image] = RouterUtil.getQueryStringInUrl(queryString).url;
    });

    return images;
  },

  /**
   * Get service icon images from images object
   * @param  {Object} images containing urls for the different image sizes
   * @return {Object}        containing urls for images. Returns default images
   * if all is not available in given object.
   */
  getServiceImages(images) {
    if (
      this.getImageSizeFromImagesObject(images, "small") == null ||
      this.getImageSizeFromImagesObject(images, "medium") == null ||
      this.getImageSizeFromImagesObject(images, "large") == null
    ) {
      return ServiceImages.NA_IMAGES;
    }

    return images;
  }
};

module.exports = FrameworkUtil;
