import UniversePackage from "../UniversePackage";
import ServiceImages from "../../../../plugins/services/src/js/constants/ServiceImages";

describe("UniversePackage", () => {
  describe("#getIcons", () => {
    it("returns a hash of icons", () => {
      const pkg = new UniversePackage({
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
      const pkg = new UniversePackage({ resources: {} });
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns a default icons with an empty object", () => {
      const pkg = new UniversePackage({});
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns a default icons with no parameters", () => {
      const pkg = new UniversePackage();
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#isCertified", () => {
    it("returns true if package is selected", () => {
      const pkg = new UniversePackage({ selected: true });
      expect(pkg.isCertified()).toEqual(true);
    });

    it("returns false if package is not selected", () => {
      const pkg = new UniversePackage({ selected: false });
      expect(pkg.isCertified()).toEqual(false);
    });
  });

  describe("#getMaintainer", () => {
    it("returns correct value", () => {
      const pkg = new UniversePackage({ maintainer: "hellothere" });
      expect(pkg.getMaintainer()).toEqual("hellothere");
    });

    it("returns null if there is no maintainer info", () => {
      const pkg = new UniversePackage({});
      expect(pkg.getMaintainer()).toEqual(undefined);
    });
  });

  describe("#getConfig", () => {
    it("returns config passed into package", () => {
      const pkg = new UniversePackage({
        config: { properties: {}, type: "object" }
      });
      expect(pkg.getConfig()).toEqual({ properties: {}, type: "object" });
    });

    it("adds type object to config when not provided", () => {
      const pkg = new UniversePackage({ config: { properties: {} } });
      expect(pkg.getConfig()).toEqual({ properties: {}, type: "object" });
    });
  });
});
