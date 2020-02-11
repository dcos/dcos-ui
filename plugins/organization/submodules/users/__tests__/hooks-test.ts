import User from "../structs/User";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });

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
