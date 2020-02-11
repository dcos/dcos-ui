import ServiceAccount from "../ServiceAccount";
import ServiceAccountList from "../ServiceAccountList";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

describe("ServiceAccountList", () => {
  describe("#constructor", () => {
    it("creates instances of ServiceAccount", () => {
      const items = [{ foo: "bar" }];

      expect(
        new ServiceAccountList({ items }).getItems()[0] instanceof
          ServiceAccount
      ).toBe(true);
    });
  });
});
