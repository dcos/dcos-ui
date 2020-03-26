import UniversePackageVersions from "../UniversePackageVersions";

describe("UniversePackageVersions", () => {
  describe("#getVersions", () => {
    it("returns empty array if packageVersions is null", () => {
      const versions = new UniversePackageVersions({
        packageVersions: null,
      });

      expect(versions.getVersions()).toEqual([]);
    });

    it("package versions are sorted", () => {
      const versions = new UniversePackageVersions({
        packageVersions: {
          "1.1.0": 1,
          "1.4.1": 2,
          "2.0.0": 3,
        },
      });
      const packageVersions = versions.getVersions();

      expect(packageVersions[0]).toEqual("2.0.0");
      expect(packageVersions[1]).toEqual("1.4.1");
      expect(packageVersions[2]).toEqual("1.1.0");
    });
  });
});
