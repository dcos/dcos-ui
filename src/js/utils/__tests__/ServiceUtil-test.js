jest.dontMock('../ServiceUtil');
jest.dontMock('../../constants/ServiceImages');

var ServiceImages = require('../../constants/ServiceImages');
var ServiceUtil = require('../ServiceUtil');

describe('ServiceUtil', function () {

  describe('#getImageSizeFromImagesObject', function () {

    beforeEach(function () {
      this.images = {
        'icon-medium': 'foo.png'
      };
    });

    it('should find the requested size of image', function () {
      var image = ServiceUtil.getImageSizeFromImagesObject(
        this.images, 'medium'
      );
      expect(image).toEqual('foo.png');
    });

    it('returns null if there are no images', function () {
      var image = ServiceUtil.getImageSizeFromImagesObject({}, 'medium');
      expect(image).toEqual(null);
    });

    it('returns null if image doesn\'t exist', function () {
      var image = ServiceUtil.getImageSizeFromImagesObject(
        this.images, 'large'
      );
      expect(image).toEqual(null);
    });

    it('returns null if image value is empty', function () {
      var images = {
        images: {
          'icon-large': ''
        }
      };

      var image = ServiceUtil.getImageSizeFromImagesObject(images, 'large');
      expect(image).toEqual(null);
    });

  });

  describe('#getServiceImages', function () {

    beforeEach(function () {
      this.images = {
        'icon-small': 'foo.png',
        'icon-medium': 'foo.png',
        'icon-large': 'foo.png'
      };
    });

    it('should return parsed images when all images are defined', function () {
      var images = ServiceUtil.getServiceImages(this.images);
      expect(images).toEqual(this.images);
    });

    it('should return default images when one size is missing', function () {
      delete this.images['icon-large'];
      var images = ServiceUtil.getServiceImages(this.images);
      expect(images).toEqual(ServiceImages.NA_IMAGES);
    });

    it('should return default images when images is null', function () {
      var images = ServiceUtil.getServiceImages(null);
      expect(images).toEqual(ServiceImages.NA_IMAGES);
    });

  });

});
