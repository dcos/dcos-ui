import SecretStoreStruct from "../SecretStoreStruct";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);

describe("SecretStoreStruct", () => {
  describe("#getDescription", () => {
    it("returns description", () => {
      const store = new SecretStoreStruct({
        description: "kennytran is awesome"
      });

      expect(store.getDescription()).toBe("kennytran is awesome");
    });
  });

  describe("#getDriver", () => {
    it("returns driver", () => {
      const store = new SecretStoreStruct({
        driver: "foobar"
      });

      expect(store.getDriver()).toBe("foobar");
    });
  });

  describe("#getInitialized", () => {
    it("returns initialized", () => {
      const store = new SecretStoreStruct({
        initialized: "foobar"
      });

      expect(store.getInitialized()).toBe("foobar");
    });
  });

  describe("#getSealed", () => {
    it("returns sealed status", () => {
      const store = new SecretStoreStruct({
        sealed: true
      });

      expect(store.getSealed()).toBe(true);
    });
  });
});
