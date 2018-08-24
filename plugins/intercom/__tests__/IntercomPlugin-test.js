jest.setMock("react-router", {
  hashHistory: {
    location: { pathname: "/foo" },
    listen() {}
  }
});

const mockAuthStore = {
  getUser: jest.fn(),
  isLoggedIn: jest.fn()
};

jest.mock("#SRC/js/stores/AuthStore", function() {
  return mockAuthStore;
});

const PluginTestUtils = require("PluginTestUtils");
const DOMUtils = require("#SRC/js/utils/DOMUtils");

const SDK = PluginTestUtils.getSDK("intercom", { enabled: true });
require("../SDK").setSDK(SDK);

const IntercomHooks = require("../hooks");

describe("IntercomHooks", function() {
  describe("Listeners", function() {
    beforeEach(function() {
      DOMUtils.appendScript = jasmine.createSpy();
    });

    describe("#pluginsConfigured", function() {
      it("appends scripts to the document head if plugin enabled", function() {
        global.analytics = { ready() {} };
        IntercomHooks.initialize({ appId: "id-123" });
        SDK.Hooks.doAction("pluginsConfigured");
        expect(DOMUtils.appendScript.calls.count()).toEqual(1);
      });
    });
  });
});
