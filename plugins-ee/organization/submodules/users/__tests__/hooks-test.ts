import User from "../structs/User";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });

require("../../../SDK").setSDK(SDK);

const UserHooks = require("../hooks");

UserHooks.initialize();

describe("UserHooks", () => {
  describe("#instantiateUserStruct", () => {
    it("instantiates User struct", () => {
      const instance = UserHooks.instantiateUserStruct({});
      expect(instance instanceof User).toBeTruthy();
    });
  });
});
