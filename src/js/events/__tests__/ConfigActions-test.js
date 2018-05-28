const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../AppDispatcher");
const Config = require("#SRC/js/config/Config").default;
const ConfigActions = require("../ConfigActions");

let thisConfiguration;

describe("ConfigActions", function() {
  describe("#fetchCCID", function() {
    const serviceID = "test";

    beforeEach(function() {
      spyOn(RequestUtil, "json");
      ConfigActions.fetchCCID(serviceID);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/navstar/lashup/key`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_CLUSTER_CCID_SUCCESS);
        expect(action.data).toEqual({ foo: "bar", baz: "qux" });
      });

      thisConfiguration.success({ foo: "bar", baz: "qux" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_CLUSTER_CCID_ERROR);
      });

      thisConfiguration.error();
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
