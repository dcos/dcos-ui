const ServiceImages = require("../../constants/ServiceImages");
const FrameworkUtil = require("../FrameworkUtil");

let thisImages, thisLabels;

describe("FrameworkUtil", function() {
  describe("#getImageSizeFromImagesObject", function() {
    beforeEach(function() {
      thisImages = {
        "icon-medium": "foo.png"
      };
    });

    it("finds the requested size of image", function() {
      var image = FrameworkUtil.getImageSizeFromImagesObject(
        thisImages,
        "medium"
      );
      expect(image).toEqual("foo.png");
    });

    it("returns null if there are no images", function() {
      var image = FrameworkUtil.getImageSizeFromImagesObject({}, "medium");
      expect(image).toEqual(null);
    });

    it("returns null if image doesn't exist", function() {
      var image = FrameworkUtil.getImageSizeFromImagesObject(
        thisImages,
        "large"
      );
      expect(image).toEqual(null);
    });

    it("returns null if image value is empty", function() {
      var images = {
        images: {
          "icon-large": ""
        }
      };

      var image = FrameworkUtil.getImageSizeFromImagesObject(images, "large");
      expect(image).toEqual(null);
    });
  });

  describe("#getServiceImages", function() {
    beforeEach(function() {
      thisImages = {
        "icon-small": "foo.png",
        "icon-medium": "foo.png",
        "icon-large": "foo.png"
      };
    });

    it("returns parsed images when all images are defined", function() {
      var images = FrameworkUtil.getServiceImages(thisImages);
      expect(images).toEqual(thisImages);
    });

    it("returns default images when one size is missing", function() {
      delete thisImages["icon-large"];
      var images = FrameworkUtil.getServiceImages(thisImages);
      expect(images).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns default images when images is null", function() {
      var images = FrameworkUtil.getServiceImages(null);
      expect(images).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#getMetadataFromLabels", function() {
    beforeEach(function() {
      thisLabels = {
        DCOS_PACKAGE_METADATA: "eyJuYW1lIjoic2VydmljZSIsImltYWdlcyI6eyJpY29" +
          "uLXNtYWxsIjoiaWNvbi1zZXJ2aWNlLXNtYWxsLnBuZyIsImljb24tbWVkaXVtIjoia" +
          "WNvbi1zZXJ2aWNlLW1lZGl1bS5wbmciLCJpY29uLWxhcmdlIjoiaWNvbi1zZXJ2aWN" +
          "lLWxhcmdlLnBuZyJ9fQ=="
      };
    });

    it("defaults to empty object", function() {
      expect(
        FrameworkUtil.getMetadataFromLabels({ DCOS_PACKAGE_METADATA: "" })
      ).toEqual({});
    });

    it("returns correct metadata", function() {
      expect(FrameworkUtil.getMetadataFromLabels(thisLabels)).toEqual({
        name: "service",
        images: {
          "icon-small": "icon-service-small.png",
          "icon-medium": "icon-service-medium.png",
          "icon-large": "icon-service-large.png"
        }
      });
    });
  });
});
