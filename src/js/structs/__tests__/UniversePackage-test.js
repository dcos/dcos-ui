import UniversePackage from "../UniversePackage";

const ServiceImages = require("../../../../plugins/services/src/js/constants/ServiceImages");

describe("UniversePackage", () => {
  describe("#getIcons", () => {
    it("returns a hash of icons", () => {
      var pkg = new UniversePackage({
        resource: {
          images: {
            "icon-small": "small.png",
            "icon-medium": "medium.png",
            "icon-large": "large.png"
          }
        }
      });
      expect(pkg.getIcons()).toEqual({
        "icon-small": "small.png",
        "icon-medium": "medium.png",
        "icon-large": "large.png"
      });
    });

    it('returns a default icons when "resources" are is empty', () => {
      var pkg = new UniversePackage({ resources: {} });
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns a default icons with an empty object", () => {
      var pkg = new UniversePackage({});
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns a default icons with no parameters", () => {
      var pkg = new UniversePackage();
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#isCertified", () => {
    it("returns true if package is selected", () => {
      var pkg = new UniversePackage({ selected: true });
      expect(pkg.isCertified()).toEqual(true);
    });

    it("returns false if package is not selected", () => {
      var pkg = new UniversePackage({ selected: false });
      expect(pkg.isCertified()).toEqual(false);
    });
  });

  describe("#getMaintainer", () => {
    it("returns correct value", () => {
      var pkg = new UniversePackage({ maintainer: "hellothere" });
      expect(pkg.getMaintainer()).toEqual("hellothere");
    });

    it("returns null if there is no maintainer info", () => {
      var pkg = new UniversePackage({});
      expect(pkg.getMaintainer()).toEqual(undefined);
    });
  });

  describe("#getConfig", () => {
    it("returns config passed into package", () => {
      var pkg = new UniversePackage({
        config: { properties: {}, type: "object" }
      });
      expect(pkg.getConfig()).toEqual({ properties: {}, type: "object" });
    });

    it("adds type object to config when not provided", () => {
      var pkg = new UniversePackage({ config: { properties: {} } });
      expect(pkg.getConfig()).toEqual({ properties: {}, type: "object" });
    });
  });
});
