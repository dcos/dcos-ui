import DOMUtils from "#SRC/js/utils/DOMUtils";

import PluginTestUtils from "PluginTestUtils";

jest.setMock("react-router", {
  hashHistory: {
    location: { pathname: "/foo" },
    listen() {}
  }
});

const SDK = PluginTestUtils.getSDK("tracking", { enabled: true });
require("../SDK").default.setSDK(SDK);

const TrackingHooks = require("../hooks").default;

describe("TrackingHooks", () => {
  describe("Listeners", () => {
    beforeEach(() => {
      DOMUtils.appendScript = jasmine.createSpy();
    });

    describe("#pluginsConfigured", () => {
      it("appends scripts to the document head if plugin enabled", () => {
        global.analytics = { ready() {} };
        TrackingHooks.initialize();
        SDK.Hooks.doAction("pluginsConfigured");
        expect(DOMUtils.appendScript.calls.count()).toEqual(1);
      });
    });
  });
});
