jest.dontMock("../index");
jest.dontMock("../hooks");

jest.setMock("react-router", {
  hashHistory: {
    location: { pathname: "/foo" },
    listen() {}
  }
});

const PluginTestUtils = require("PluginTestUtils");

const SDK = PluginTestUtils.getSDK("tracking", { enabled: true });
require("../SDK").setSDK(SDK);

const DOMUtils = SDK.get("DOMUtils");
const TrackingHooks = require("../hooks");

describe("TrackingHooks", function() {
  describe("Listeners", function() {
    beforeEach(function() {
      DOMUtils.appendScript = jasmine.createSpy();
    });

    describe("#pluginsConfigured", function() {
      it("appends scripts to the document head if plugin enabled", function() {
        global.analytics = { ready() {} };
        TrackingHooks.initialize();
        SDK.Hooks.doAction("pluginsConfigured");
        expect(DOMUtils.appendScript.calls.count()).toEqual(1);
      });
    });
  });
});
