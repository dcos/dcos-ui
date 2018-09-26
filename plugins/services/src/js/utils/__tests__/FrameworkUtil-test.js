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
        DCOS_PACKAGE_METADATA:
          "eyJuYW1lIjoic2VydmljZSIsImltYWdlcyI6eyJpY29" +
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

  describe("#extractBaseTechVersion", () => {
    it("returns given version without dash", () => {
      expect(FrameworkUtil.extractBaseTechVersion("1.2.3")).toEqual("1.2.3");
    });
    it("returns given base tech with 1 dash", () => {
      expect(FrameworkUtil.extractBaseTechVersion("1.2.3-2.3.4")).toEqual(
        "2.3.4"
      );
    });
    it("returns given first and second base tech with 2 dashes", () => {
      expect(
        FrameworkUtil.extractBaseTechVersion("1.2.3-2.3.4e-lorem")
      ).toEqual("2.3.4e-lorem");
    });
    it("returns given base tech and 'beta' suffix with 2 dashes", () => {
      expect(FrameworkUtil.extractBaseTechVersion("1.2.3-2.3.4-beta")).toEqual(
        "2.3.4-beta"
      );
    });
    it("returns N/A on undefined version", () => {
      expect(FrameworkUtil.extractBaseTechVersion()).toEqual("N/A");
    });
  });

  describe("#extractImageUrls", () => {
    it("extracts icon urls", () => {
      const input = {
        "icon-large":
          "http://localhost/package/resource?url=https://downloads.mesosphere.com/assets/universe/000/grafana-icon-large.png",
        "icon-medium":
          "http://localhost/package/resource?url=https://downloads.mesosphere.com/assets/universe/000/grafana-icon-medium.png",
        "icon-small":
          "http://localhost/package/resource?url=https://downloads.mesosphere.com/assets/universe/000/grafana-icon-small.png"
      };

      expect(FrameworkUtil.extractImageUrls(input)).toEqual({
        "icon-large":
          "https://downloads.mesosphere.com/assets/universe/000/grafana-icon-large.png",
        "icon-medium":
          "https://downloads.mesosphere.com/assets/universe/000/grafana-icon-medium.png",
        "icon-small":
          "https://downloads.mesosphere.com/assets/universe/000/grafana-icon-small.png"
      });
    });

    it("supports partial response", () => {
      const input = {
        "icon-small":
          "http://localhost/package/resource?url=https://downloads.mesosphere.com/assets/universe/000/grafana-icon-small.png"
      };

      expect(FrameworkUtil.extractImageUrls(input)).toEqual({
        "icon-small":
          "https://downloads.mesosphere.com/assets/universe/000/grafana-icon-small.png"
      });
    });

    it("skips non string fields", () => {
      const input = {
        screenshots: [
          "http://localhost/package/resource?url=https://downloads.mesosphere.com/assets/universe/000/grafana-screenshot.png"
        ]
      };

      expect(FrameworkUtil.extractImageUrls(input)).toEqual({
        screenshots: [
          "http://localhost/package/resource?url=https://downloads.mesosphere.com/assets/universe/000/grafana-screenshot.png"
        ]
      });
    });
  });
});
