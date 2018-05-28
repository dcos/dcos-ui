const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const Config = require("#SRC/js/config/Config").default;
const VirtualNetworksActions = require("../VirtualNetworksActions");
const AppDispatcher = require("../AppDispatcher");

const { virtualNetworksApi } = Config;

let thisConfiguration;

describe("VirtualNetworksActions", function() {
  describe("#fetch", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      VirtualNetworksActions.fetch();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS
        );
      });
      thisConfiguration.success({ agents: [], network: { overlays: [] } });
    });

    it("requests the right URL", function() {
      VirtualNetworksActions.fetch();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

      expect(thisConfiguration.url).toEqual(virtualNetworksApi + "/state");
    });

    it("dispatches the correct data when successful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ overlays: [] });
      });

      thisConfiguration.success({ agents: [], network: { overlays: [] } });
    });

    it("dispatches the correct action when unsuccessful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_VIRTUAL_NETWORKS_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct data when unsuccessful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
