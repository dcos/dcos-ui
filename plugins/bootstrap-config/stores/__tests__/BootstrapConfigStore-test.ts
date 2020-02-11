import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("bootstrapConfig", { enabled: true });

require("../../SDK").setSDK(SDK);

const BootstrapConfigActions = require("../../events/BootstrapConfigActions")
  .default;
const BootstrapConfigStore = require("../BootstrapConfigStore").default;

const EventTypes = require("../../constants/EventTypes");
const BootstrapConfigReducer = require("../../Reducer");

PluginSDK.__addReducer("bootstrapConfig", BootstrapConfigReducer);

let thisHandler;

describe("BootstrapConfigStore", () => {
  describe("#fetchBootstrapConfig", () => {
    it("hands off the call to BootstrapConfigActions", () => {
      spyOn(BootstrapConfigActions, "fetchBootstrapConfig");
      BootstrapConfigStore.fetchBootstrapConfig();
      expect(BootstrapConfigActions.fetchBootstrapConfig).toHaveBeenCalled();
    });
  });

  describe("#processBootstrap", () => {
    beforeEach(() => {
      thisHandler = jest.fn();
      BootstrapConfigStore.once(
        EventTypes.BOOTSTRAP_CONFIG_SUCCESS,
        thisHandler
      );
      BootstrapConfigStore.processBootstrapConfig({ security: "permissive" });
    });

    it("emits an event", () => {
      expect(thisHandler).toHaveBeenCalled();
    });

    it("stores info in the redux store", () => {
      expect(BootstrapConfigStore.getSecurityMode()).toEqual("permissive");
    });

    it("returns stored info", () => {
      expect(BootstrapConfigStore.getSecurityMode()).toEqual("permissive");
    });
  });
});
