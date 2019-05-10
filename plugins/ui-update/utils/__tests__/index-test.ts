import * as utils from "../index";
import { Package } from "#SRC/js/data/cosmos/Package";
import { UIMetadata } from "#SRC/js/data/ui-update/UIMetadata";

describe("utils", () => {
  describe("#versionUpdateAvailable", () => {
    it("return latest version", () => {
      const fakePackageInfo: Package = {
        name: "dcos-ui",
        versions: [
          {
            version: "1.0.0",
            revision: "0"
          },
          {
            version: "1.5.0",
            revision: "0"
          },
          {
            version: "2.0.0",
            revision: "0"
          },
          {
            version: "2.1.0",
            revision: "0"
          }
        ]
      };
      const fakeUiMetadata: UIMetadata = {
        packageVersionIsDefault: true,
        packageVersion: "Default",
        serverBuild: "master+v1.0.0"
      };
      const result = utils.versionUpdateAvailable(
        fakePackageInfo,
        fakeUiMetadata
      );
      expect(result).not.toBeNull();
      // @ts-ignore
      expect(result.version).toEqual("1.5.0");
    });
    it("use packageVersion for comparison if available", () => {
      const fakePackageInfo: Package = {
        name: "dcos-ui",
        versions: [
          {
            version: "1.0.0",
            revision: "0"
          },
          {
            version: "1.5.0",
            revision: "0"
          },
          {
            version: "2.0.0",
            revision: "0"
          },
          {
            version: "2.1.0",
            revision: "0"
          }
        ]
      };
      const fakeUiMetadata: UIMetadata = {
        packageVersionIsDefault: false,
        packageVersion: "1.1.0",
        serverBuild: "master+v0.0.0"
      };
      const result = utils.versionUpdateAvailable(
        fakePackageInfo,
        fakeUiMetadata
      );
      expect(result).not.toBeNull();
      // @ts-ignore
      expect(result.version).toEqual("1.5.0");
    });
    it("returns null if there is no newer package", () => {
      const fakePackageInfo: Package = {
        name: "dcos-ui",
        versions: [
          {
            version: "1.0.0",
            revision: "0"
          }
        ]
      };
      const fakeUiMetadata: UIMetadata = {
        packageVersionIsDefault: false,
        packageVersion: "1.1.0",
        serverBuild: "master+v0.0.0"
      };
      const result = utils.versionUpdateAvailable(
        fakePackageInfo,
        fakeUiMetadata
      );
      expect(result).toBeNull();
    });
    it("returns null if newer package is different major version", () => {
      const fakePackageInfo: Package = {
        name: "dcos-ui",
        versions: [
          {
            version: "3.0.0",
            revision: "0"
          }
        ]
      };
      const fakeUiMetadata: UIMetadata = {
        packageVersionIsDefault: false,
        packageVersion: "1.1.0",
        serverBuild: "master+v0.0.0"
      };
      const result = utils.versionUpdateAvailable(
        fakePackageInfo,
        fakeUiMetadata
      );
      expect(result).toBeNull();
    });
  });
});
