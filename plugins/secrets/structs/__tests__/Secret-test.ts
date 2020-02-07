import PluginTestUtils from "PluginTestUtils";

const Secret = require("../../structs/Secret").default;

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);

describe("Secret", () => {
  describe("#getAuthor", () => {
    it("returns description", () => {
      const secret = new Secret({
        author: "kennytran"
      });

      expect(secret.getAuthor()).toBe("kennytran");
    });
  });

  describe("#getValue", () => {
    it("returns uid", () => {
      const secret = new Secret({
        value: "foobar"
      });

      expect(secret.getValue()).toBe("foobar");
    });
  });

  describe("#getCreatedAt", () => {
    it("returns an instance of Secret", () => {
      const secret = new Secret({
        created: "10/19/1993"
      });

      expect(secret.getCreatedAt()).toBe("10/19/1993");
    });
  });

  describe("#isBinary", () => {
    it("returns true if contentType is application/octet-stream", () => {
      const secret = new Secret({
        contentType: "application/octet-stream"
      });

      expect(secret.isBinary()).toBe(true);
    });
  });
});
