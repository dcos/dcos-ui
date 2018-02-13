const ServiceImages = require("../../../../plugins/services/src/js/constants/ServiceImages");
const UniversePackage = require("../UniversePackage");

describe("UniversePackage", function() {
  describe("#getIcons", function() {
    it("returns a hash of icons", function() {
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

    it('returns a default icons when "resources" are is empty', function() {
      var pkg = new UniversePackage({ resources: {} });
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns a default icons with an empty object", function() {
      var pkg = new UniversePackage({});
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns a default icons with no parameters", function() {
      var pkg = new UniversePackage();
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#isCertified", function() {
    it("returns true if package is selected", function() {
      var pkg = new UniversePackage({ selected: true });
      expect(pkg.isCertified()).toEqual(true);
    });

    it("returns false if package is not selected", function() {
      var pkg = new UniversePackage({ selected: false });
      expect(pkg.isCertified()).toEqual(false);
    });
  });

  describe("#getMaintainer", function() {
    it("returns correct value", function() {
      var pkg = new UniversePackage({ maintainer: "hellothere" });
      expect(pkg.getMaintainer()).toEqual("hellothere");
    });

    it("returns null if there is no maintainer info", function() {
      var pkg = new UniversePackage({});
      expect(pkg.getMaintainer()).toEqual(undefined);
    });
  });

  describe("#getConfig", function() {
    it("returns config passed into package", function() {
      var pkg = new UniversePackage({
        config: { properties: {}, type: "object" }
      });
      expect(pkg.getConfig()).toEqual({ properties: {}, type: "object" });
    });

    it("adds type object to config when not provided", function() {
      var pkg = new UniversePackage({ config: { properties: {} } });
      expect(pkg.getConfig()).toEqual({ properties: {}, type: "object" });
    });
  });
});
