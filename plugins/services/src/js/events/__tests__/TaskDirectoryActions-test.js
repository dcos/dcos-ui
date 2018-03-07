const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const TaskDirectoryActions = require("../TaskDirectoryActions");
const Config = require("#SRC/js/config/Config");

let thisConfiguration,
  thisRequestUtilJSON,
  thisConfigRootUrl,
  thisConfigUseFixtures;

describe("TaskDirectoryActions", function() {
  beforeEach(function() {
    thisConfiguration = null;
    thisRequestUtilJSON = RequestUtil.json;
    RequestUtil.json = function(configuration) {
      thisConfiguration = configuration;
    };
    thisConfigRootUrl = Config.rootUrl;
    thisConfigUseFixtures = Config.useFixtures;
    Config.rootUrl = "";
    Config.useFixtures = false;
  });

  afterEach(function() {
    RequestUtil.json = thisRequestUtilJSON;
    Config.rootUrl = thisConfigRootUrl;
    Config.useFixtures = thisConfigUseFixtures;
  });

  describe("#fetchNodeState", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      TaskDirectoryActions.fetchNodeState(
        { framework_id: "foo", id: "bar", slave_id: "baz" },
        { pid: "foobar@baz", id: "baz" },
        "some/path"
      );
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        thisConfigRootUrl + "/agent/baz/foobar/state"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_NODE_STATE_SUCCESS);
        expect(action.task.id).toEqual("bar");
        expect(action.node).toEqual({ pid: "foobar@baz", id: "baz" });
        expect(action.innerPath).toEqual("some/path");
        expect(action.data).toEqual("some response");
      });

      thisConfiguration.success("some response");
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_NODE_STATE_ERROR);
        expect(action.data).toEqual("foo");
        expect(action.task.id).toEqual("bar");
        expect(action.node).toEqual({ pid: "foobar@baz", id: "baz" });
      });

      thisConfiguration.error({ message: "foo" });
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

  describe("#fetchDirectory", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      TaskDirectoryActions.fetchDirectory(
        { framework_id: "foo", id: "bar", slave_id: "baz" },
        "",
        {
          frameworks: [
            { id: "foo", executors: [{ id: "bar", directory: "quis" }] }
          ]
        }
      );
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        thisConfigRootUrl + "/agent/baz/files/browse"
      );
    });

    it("fetches data with path in data", function() {
      expect(thisConfiguration.data).toEqual({ path: "quis/" });
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_TASK_DIRECTORY_SUCCESS);
        expect(action.task.id).toEqual("bar");
        expect(action.innerPath).toEqual("");
        expect(action.data).toEqual("directory");
      });

      thisConfiguration.success("directory");
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_TASK_DIRECTORY_ERROR);
        expect(action.data).toEqual("foo");
        expect(action.task.id).toEqual("bar");
      });

      thisConfiguration.error({ message: "foo" });
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
