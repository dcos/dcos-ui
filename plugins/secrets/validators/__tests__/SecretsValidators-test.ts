import PluginSDK from "PluginSDK";
import SecretsValidators from "../SecretsValidators";

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

describe("SecretsValidators", () => {
  describe("#envMustHaveSecretPart", () => {
    it("returns no errors when there are no env", () => {
      const spec = {};
      expect(SecretsValidators.envMustHaveSecretPart(spec)).toEqual([]);
    });

    it("returns no errors when definition is correct", () => {
      const spec = {
        secrets: {
          secret0: {
            source: "bla",
          },
        },
        env: {
          FOO: {
            secret: "secret0",
          },
        },
      };
      expect(SecretsValidators.envMustHaveSecretPart(spec)).toEqual([]);
    });

    it("returns an error when definition is partial", () => {
      const spec = {
        env: {
          BAR: {
            secret: "missing",
          },
        },
      };
      expect(SecretsValidators.envMustHaveSecretPart(spec)).toEqual([
        {
          path: ["secrets", "missing"],
          message: "The secret cannot be empty",
          type: "SECRET_MISSING",
        },
      ]);
    });
  });
  describe("#appVolumeMustHaveSecretPart", () => {
    it("returns no errors when there are no container volumes", () => {
      const spec = {
        container: {},
      };
      expect(SecretsValidators.appVolumeMustHaveSecretPart(spec)).toEqual([]);
    });

    it("returns no errors when there container volumes is empty", () => {
      const spec = {
        container: {
          volumes: [],
        },
      };
      expect(SecretsValidators.appVolumeMustHaveSecretPart(spec)).toEqual([]);
    });

    it("returns no errors when the definition is correct", () => {
      const spec = {
        container: {
          volumes: [
            {
              containerPath: "secrets/test",
              secret: "test_secret",
            },
          ],
        },
        secrets: {
          test_secret: {
            source: "foo/bar",
          },
        },
      };
      expect(SecretsValidators.appVolumeMustHaveSecretPart(spec)).toEqual([]);
    });

    it("returns an error when definition is partial", () => {
      const spec = {
        container: {
          volumes: [
            {
              containerPath: "secrets/test",
              secret: "secret0",
            },
          ],
        },
      };
      expect(SecretsValidators.appVolumeMustHaveSecretPart(spec)).toEqual([
        {
          path: ["secrets", "secret0"],
          message: "The secret cannot be empty",
          type: "SECRET_MISSING",
        },
      ]);
    });
  });
  describe("#podVolumeMustHaveSecretPart", () => {
    it("returns no errors when there are no volumes", () => {
      const spec = {
        containers: [
          {
            name: "test",
          },
        ],
      };

      expect(SecretsValidators.podVolumeMustHaveSecretPart(spec)).toEqual([]);
    });
    it("returns no errors when volumes is empty", () => {
      const spec = {
        containers: [
          {
            name: "test",
          },
        ],
        volumes: [],
      };

      expect(SecretsValidators.podVolumeMustHaveSecretPart(spec)).toEqual([]);
    });
    it("returns no errors when the definition is correct", () => {
      const spec = {
        containers: [
          {
            name: "test",
          },
        ],
        volumes: [
          {
            name: "secret-volume",
            secret: "secret0",
          },
        ],
        secrets: {
          secret0: {
            source: "unit-test",
          },
        },
      };

      expect(SecretsValidators.podVolumeMustHaveSecretPart(spec)).toEqual([]);
    });
    it("returns an error when secret volume definition is missing secret", () => {
      const spec = {
        containers: [
          {
            name: "test",
          },
        ],
        volumes: [
          {
            name: "secret-volume",
            secret: "secret1",
          },
        ],
        secrets: {
          secret0: {
            source: "unit-test",
          },
        },
      };

      expect(SecretsValidators.podVolumeMustHaveSecretPart(spec)).toEqual([
        {
          path: ["secrets", "secret1"],
          type: "SECRET_MISSING",
          message: "The secret cannot be empty",
        },
      ]);
    });
  });
  describe("#validSecretContainerPath", () => {
    it("returns false for empty path", () => {
      expect(SecretsValidators.validSecretContainerPath("")).toEqual(false);
    });
    it("returns false for null path", () => {
      expect(SecretsValidators.validSecretContainerPath(null)).toEqual(false);
    });
    it("returns true for absolute path", () => {
      expect(SecretsValidators.validSecretContainerPath("/file")).toEqual(true);
    });
    it("returns false for directory path", () => {
      expect(SecretsValidators.validSecretContainerPath("dir/")).toEqual(false);
    });
    it("returns false for path with parent references", () => {
      expect(
        SecretsValidators.validSecretContainerPath("dir/../../file")
      ).toEqual(false);
    });
    it("returns false for path with invalid characters", () => {
      expect(SecretsValidators.validSecretContainerPath("f<")).toEqual(false);
    });
    it("returns true for valid root path", () => {
      expect(SecretsValidators.validSecretContainerPath("my_secret")).toEqual(
        true
      );
    });
    it("returns true for valid path sub-folders", () => {
      expect(
        SecretsValidators.validSecretContainerPath("secrets/my_secret")
      ).toEqual(true);
    });
  });
});
