import FrameworkUtil from "../FrameworkUtil";

import ServiceImages from "../../constants/ServiceImages";

let thisImages, thisLabels;

describe("FrameworkUtil", () => {
  describe("#getImageSizeFromImagesObject", () => {
    beforeEach(() => {
      thisImages = {
        "icon-medium": "foo.png"
      };
    });

    it("finds the requested size of image", () => {
      const image = FrameworkUtil.getImageSizeFromImagesObject(
        thisImages,
        "medium"
      );
      expect(image).toEqual("foo.png");
    });

    it("returns null if there are no images", () => {
      const image = FrameworkUtil.getImageSizeFromImagesObject({}, "medium");
      expect(image).toEqual(null);
    });

    it("returns null if image doesn't exist", () => {
      const image = FrameworkUtil.getImageSizeFromImagesObject(
        thisImages,
        "large"
      );
      expect(image).toEqual(null);
    });

    it("returns null if image value is empty", () => {
      const images = {
        images: {
          "icon-large": ""
        }
      };

      const image = FrameworkUtil.getImageSizeFromImagesObject(images, "large");
      expect(image).toEqual(null);
    });
  });

  describe("#getServiceImages", () => {
    beforeEach(() => {
      thisImages = {
        "icon-small": "foo.png",
        "icon-medium": "foo.png",
        "icon-large": "foo.png"
      };
    });

    it("returns parsed images when all images are defined", () => {
      const images = FrameworkUtil.getServiceImages(thisImages);
      expect(images).toEqual(thisImages);
    });

    it("returns default images when one size is missing", () => {
      delete thisImages["icon-large"];
      const images = FrameworkUtil.getServiceImages(thisImages);
      expect(images).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns default images when images is null", () => {
      const images = FrameworkUtil.getServiceImages(null);
      expect(images).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#getMetadataFromLabels", () => {
    beforeEach(() => {
      thisLabels = {
        DCOS_PACKAGE_METADATA:
          "eyJuYW1lIjoic2VydmljZSIsImltYWdlcyI6eyJpY29" +
          "uLXNtYWxsIjoiaWNvbi1zZXJ2aWNlLXNtYWxsLnBuZyIsImljb24tbWVkaXVtIjoia" +
          "WNvbi1zZXJ2aWNlLW1lZGl1bS5wbmciLCJpY29uLWxhcmdlIjoiaWNvbi1zZXJ2aWN" +
          "lLWxhcmdlLnBuZyJ9fQ=="
      };
    });

    it("defaults to empty object", () => {
      expect(
        FrameworkUtil.getMetadataFromLabels({ DCOS_PACKAGE_METADATA: "" })
      ).toEqual({});
    });

    it("returns correct metadata", () => {
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
