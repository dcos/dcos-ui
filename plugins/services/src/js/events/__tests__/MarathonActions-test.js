jest.dontMock("../../../../../../src/js/events/AppDispatcher");
jest.dontMock("../../../../../../src/js/events/UnitHealthActions");
jest.dontMock("../../../../../../src/js/config/Config");
jest.dontMock("../../constants/ActionTypes");

const Hooks = require("PluginSDK").Hooks;
const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const Application = require("../../structs/Application");
const ApplicationSpec = require("../../structs/ApplicationSpec");
const AppDispatcher = require("../../../../../../src/js/events/AppDispatcher");
const Config = require("../../../../../../src/js/config/Config");
const MarathonActions = require("../MarathonActions");
const Pod = require("../../structs/Pod");
const PodSpec = require("../../structs/PodSpec");

Hooks.addFilter("hasCapability", function() {
  return true;
});

describe("MarathonActions", function() {
  describe("#createGroup", function() {
    const newGroupId = "test";

    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.createGroup({ id: newGroupId });
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups`
      );
    });

    it("uses POST for the request method", function() {
      expect(this.configuration.method).toEqual("POST");
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_CREATE_SUCCESS
        );
      });

      this.configuration.success({
        version: "2016-05-13T10:26:55.840Z",
        deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_CREATE_ERROR
        );
      });

      this.configuration.error({ message: "error" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#deleteGroup", function() {
    const groupDefinition = {
      id: "/test"
    };

    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.deleteGroup(groupDefinition.id);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups/%2Ftest`
      );
    });

    it("uses DELETE for the request method", function() {
      expect(this.configuration.method).toEqual("DELETE");
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_DELETE_SUCCESS
        );
      });

      this.configuration.success({
        version: "2016-05-13T10:26:55.840Z",
        deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_DELETE_ERROR
        );
      });

      this.configuration.error({ message: "error", response: "{}" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#editGroup", function() {
    const groupDefinition = {
      id: "/test"
    };

    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.editGroup(groupDefinition);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups/%2Ftest`
      );
    });

    it("sends data to the correct URL with the force=true parameter", function() {
      MarathonActions.editGroup(groupDefinition, true);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];

      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups/%2Ftest?force=true`
      );
    });

    it("uses PUT for the request method", function() {
      expect(this.configuration.method).toEqual("PUT");
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_EDIT_SUCCESS
        );
      });

      this.configuration.success({
        version: "2016-05-13T10:26:55.840Z",
        deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_EDIT_ERROR
        );
      });

      this.configuration.error({ message: "error", response: "{}" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#createService", function() {
    describe("app", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.createService(
          new ApplicationSpec({
            id: "/test",
            cmd: "sleep 100;"
          })
        );
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps`
        );
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps`
        );
      });

      it("uses POST for the request method", function() {
        expect(this.configuration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_SUCCESS
          );
        });

        this.configuration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });

    describe("pod", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.createService(
          new PodSpec({
            id: "/test",
            cmd: "sleep 100;"
          })
        );
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods`
        );
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods`
        );
      });

      it("uses POST for the request method", function() {
        expect(this.configuration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_SUCCESS
          );
        });

        this.configuration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });
  });

  describe("#deleteService", function() {
    describe("app", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.deleteService(new Application({ id: "/test" }));
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test`
        );
      });

      it("uses DELETE for the request method", function() {
        expect(this.configuration.method).toEqual("DELETE");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
          );
        });

        this.configuration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });

    describe("pod", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.deleteService(new Pod({ id: "/test" }));
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test`
        );
      });

      it("uses DELETE for the request method", function() {
        expect(this.configuration.method).toEqual("DELETE");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
          );
        });

        this.configuration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });
  });

  describe("#editService", function() {
    describe("app", function() {
      const app = new Application({ id: "/test" });
      const spec = new ApplicationSpec({ cmd: "sleep 100;" });

      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.editService(app, spec);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test?partialUpdate=false`
        );
      });

      it("sends data to the correct URL with the force=true parameter", function() {
        MarathonActions.editService(app, spec, true);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];

        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test?force=true&partialUpdate=false`
        );
      });

      it("uses PUT for the request method", function() {
        expect(this.configuration.method).toEqual("PUT");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_SUCCESS
          );
        });

        this.configuration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });

    describe("pods", function() {
      const pod = new Pod({ id: "/test" });
      const spec = new PodSpec({ cmd: "sleep 100;" });

      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.editService(pod, spec);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test?partialUpdate=false`
        );
      });

      it("sends data to the correct URL with the force=true parameter", function() {
        MarathonActions.editService(pod, spec, true);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];

        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test?force=true&partialUpdate=false`
        );
      });

      it("uses PUT for the request method", function() {
        expect(this.configuration.method).toEqual("PUT");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_SUCCESS
          );
        });

        this.configuration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });
  });

  describe("#restartService", function() {
    describe("app", function() {
      const app = new Application({ id: "/test" });

      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.restartService(app);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test/restart`
        );
      });

      it("sends data to the correct URL with the force=true parameter", function() {
        MarathonActions.restartService(app, true);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];

        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test/restart?force=true`
        );
      });

      it("uses POST for the request method", function() {
        expect(this.configuration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_SUCCESS
          );
        });

        this.configuration.success({});
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });

    describe("pods", function() {
      const pod = new Pod({ id: "/test" });

      beforeEach(function() {
        spyOn(RequestUtil, "json");
        MarathonActions.restartService(pod);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test/restart`
        );
      });

      it("sends data to the correct URL with the force=true parameter", function() {
        MarathonActions.restartService(pod, true);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];

        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test/restart?force=true`
        );
      });

      it("uses POST for the request method", function() {
        expect(this.configuration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_SUCCESS
          );
        });

        this.configuration.success({});
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_ERROR
          );
        });

        this.configuration.error({ message: "error", response: "{}" });
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

        this.configuration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });
  });

  describe("#fetchDeployments", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchDeployments();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/deployments`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_SUCCESS
        );
      });

      this.configuration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: "/",
        version: "2001-01-01T01:01:01.001Z"
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_ERROR
        );
      });

      this.configuration.error({ message: "error" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchGroups", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchGroups();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUPS_SUCCESS
        );
      });

      this.configuration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: "/",
        version: "2016-05-02T16:07:32.583Z"
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_GROUPS_ERROR);
      });

      this.configuration.error({ message: "error" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchQueue", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchQueue();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/queue`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_QUEUE_SUCCESS);
      });

      this.configuration.success({
        queue: [
          {
            app: {
              id: "/service-id"
            },
            delay: {
              timeLeftSeconds: 0,
              overdue: true
            }
          }
        ]
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_QUEUE_ERROR);
      });

      this.configuration.error({ message: "error" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchServiceVersion", function() {
    const serviceID = "test";
    const versionID = "2016-05-02T16:07:32.583Z";

    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchServiceVersion(serviceID, versionID);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/apps/${serviceID}/versions/${versionID}`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_SUCCESS
        );
      });

      this.configuration.success({
        serviceID,
        versionID,
        versions: ["2016-05-02T16:07:32.583Z"]
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_ERROR
        );
      });

      this.configuration.error({ message: "error" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchServiceVersions", function() {
    const serviceID = "test";

    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchServiceVersions(serviceID);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/apps/${serviceID}/versions`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS
        );
      });

      this.configuration.success({
        serviceID,
        versions: ["2016-05-02T16:07:32.583Z"]
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_ERROR
        );
      });

      this.configuration.error({ message: "error" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchMarathonInstanceInfo", function() {
    const serviceID = "test";

    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchMarathonInstanceInfo(serviceID);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/info`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_INSTANCE_INFO_SUCCESS
        );
        expect(action.data).toEqual({ foo: "bar", baz: "qux" });
      });

      this.configuration.success({ foo: "bar", baz: "qux" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_INSTANCE_INFO_ERROR
        );
      });

      this.configuration.error({ message: "error" });
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#revertDeployment", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.revertDeployment("deployment-id");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    describe("JSON request", function() {
      it("is made", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("is a DELETE", function() {
        expect(this.configuration.method).toEqual("DELETE");
      });

      it("calls the appropriate endpoint", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/deployments/deployment-id`
        );
      });
    });

    describe("on success", function() {
      it("emits a success event on success", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS
          );
        });

        this.configuration.success({});
      });

      it("emits the original deployment ID as the success payload", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.data.originalDeploymentID).toEqual("deployment-id");
        });

        this.configuration.success({});
      });
    });

    it("emits an error event on error", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR
        );
      });

      this.configuration.error({});
    });

    it("emits the original deployment ID in the error payload", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.originalDeploymentID).toEqual("deployment-id");
      });

      this.configuration.error({});
    });

    it("emits the response text in the error payload", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.error).toEqual({
          message: "A helpful error message."
        });
      });

      this.configuration.error({
        responseText: JSON.stringify({ message: "A helpful error message." })
      });
    });

    it("emits the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#killTasks", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MarathonActions.killTasks(["task1", "task2"], false);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    describe("JSON request", function() {
      it("is made", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("is a POST", function() {
        expect(this.configuration.method).toEqual("POST");
      });

      it("calls the appropriate endpoint", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/tasks/delete`
        );
      });

      it("calls the appropriate endpoint if scaled is true", function() {
        MarathonActions.killTasks(["task1", "task2"], true);
        const configuration = RequestUtil.json.calls.mostRecent().args[0];
        expect(configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/tasks/delete?scale=true`
        );
      });
    });

    describe("on success", function() {
      it("emits a success event on success", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_TASK_KILL_SUCCESS
          );
        });

        this.configuration.success({});
      });
    });

    it("emits an error event on error", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_TASK_KILL_ERROR
        );
      });

      this.configuration.error({});
    });

    it("emits the response text in the error payload", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ message: "A helpful error message." });
      });

      this.configuration.error({
        responseText: JSON.stringify({ message: "A helpful error message." })
      });
    });

    it("emits the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
