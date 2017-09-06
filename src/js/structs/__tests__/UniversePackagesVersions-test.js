const UniversePackagesVersions = require("../UniversePackagesVersions");

describe("UniversePackagesVersions", function() {
  describe("#getPackageByName", function() {
    let UniversePackageVersions;

    beforeEach(function() {
      UniversePackageVersions = new UniversePackagesVersions({
        marathon: {
          packageVersions: {
            "1.1.0": 1,
            "1.4.1": 2,
            "2.0.0": 3
          }
        }
      });
    });

    it("get package by name", function() {
      const packageVersions = UniversePackageVersions.getPackageByName(
        "marathon"
      );
      const expectedResult = ["2.0.0", "1.4.1", "1.1.0"];

      expect(packageVersions).toEqual(expectedResult);
    });

    it("package versions are sorted by", function() {
      const packageVersions = UniversePackageVersions.getPackageByName(
        "marathon"
      );

      expect(packageVersions[0]).toEqual("2.0.0");
      expect(packageVersions[1]).toEqual("1.4.1");
      expect(packageVersions[2]).toEqual("1.1.0");
    });
  });
});
