import AppDispatcher from "#SRC/js/events/AppDispatcher";
import Application from "../../structs/Application";
import ApplicationSpec from "../../structs/ApplicationSpec";
import MarathonActions from "../MarathonActions";
import Pod from "../../structs/Pod";
import PodSpec from "../../structs/PodSpec";

const Hooks = require("PluginSDK").Hooks;
const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const Config = require("#SRC/js/config/Config").default;

Hooks.addFilter("hasCapability", () => true);

let thisConfiguration;

describe("MarathonActions", () => {
  describe("#createGroup", () => {
    const newGroupId = "test";

    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.createGroup({ id: newGroupId });
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups`
      );
    });

    it("uses POST for the request method", () => {
      expect(thisConfiguration.method).toEqual("POST");
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_CREATE_SUCCESS
        );
      });

      thisConfiguration.success({
        version: "2016-05-13T10:26:55.840Z",
        deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_CREATE_ERROR
        );
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#deleteGroup", () => {
    const groupDefinition = {
      id: "/test"
    };

    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.deleteGroup(groupDefinition.id);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups/%2Ftest`
      );
    });

    it("uses DELETE for the request method", () => {
      expect(thisConfiguration.method).toEqual("DELETE");
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_DELETE_SUCCESS
        );
      });

      thisConfiguration.success({
        version: "2016-05-13T10:26:55.840Z",
        deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_DELETE_ERROR
        );
      });

      thisConfiguration.error({ message: "error", response: "{}" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#editGroup", () => {
    const groupDefinition = {
      id: "/test"
    };

    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.editGroup(groupDefinition);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups/%2Ftest`
      );
    });

    it("sends data to the correct URL with the force=true parameter", () => {
      MarathonActions.editGroup(groupDefinition, true);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups/%2Ftest?force=true`
      );
    });

    it("uses PUT for the request method", () => {
      expect(thisConfiguration.method).toEqual("PUT");
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_EDIT_SUCCESS
        );
      });

      thisConfiguration.success({
        version: "2016-05-13T10:26:55.840Z",
        deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUP_EDIT_ERROR
        );
      });

      thisConfiguration.error({ message: "error", response: "{}" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#createService", () => {
    describe("app", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.createService(
          new ApplicationSpec({
            id: "/test",
            cmd: "sleep 100;"
          })
        );
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps`
        );
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps`
        );
      });

      it("uses POST for the request method", () => {
        expect(thisConfiguration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_SUCCESS
          );
        });

        thisConfiguration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

    describe("pod", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.createService(
          new PodSpec({
            id: "/test",
            cmd: "sleep 100;"
          })
        );
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods`
        );
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods`
        );
      });

      it("uses POST for the request method", () => {
        expect(thisConfiguration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_SUCCESS
          );
        });

        thisConfiguration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

  describe("#deleteService", () => {
    describe("app", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.deleteService(new Application({ id: "/test" }));
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test`
        );
      });

      it("uses DELETE for the request method", () => {
        expect(thisConfiguration.method).toEqual("DELETE");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
          );
        });

        thisConfiguration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

    describe("pod", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.deleteService(new Pod({ id: "/test" }));
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test`
        );
      });

      it("uses DELETE for the request method", () => {
        expect(thisConfiguration.method).toEqual("DELETE");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
          );
        });

        thisConfiguration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

  describe("#editService", () => {
    describe("app", () => {
      const app = new Application({ id: "/test" });
      const spec = new ApplicationSpec({ cmd: "sleep 100;" });

      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.editService(app, spec);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test?partialUpdate=false`
        );
      });

      it("sends data to the correct URL with the force=true parameter", () => {
        MarathonActions.editService(app, spec, true);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test?force=true&partialUpdate=false`
        );
      });

      it("uses PUT for the request method", () => {
        expect(thisConfiguration.method).toEqual("PUT");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_SUCCESS
          );
        });

        thisConfiguration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

    describe("pods", () => {
      const pod = new Pod({ id: "/test" });
      const spec = new PodSpec({ cmd: "sleep 100;" });

      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.editService(pod, spec);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test?partialUpdate=false`
        );
      });

      it("sends data to the correct URL with the force=true parameter", () => {
        MarathonActions.editService(pod, spec, true);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test?force=true&partialUpdate=false`
        );
      });

      it("uses PUT for the request method", () => {
        expect(thisConfiguration.method).toEqual("PUT");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_SUCCESS
          );
        });

        thisConfiguration.success({
          version: "2016-05-13T10:26:55.840Z",
          deploymentId: "6119207e-a146-44b4-9c6f-0e4227dc04a5"
        });
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

  describe("#resetDelayedService", () => {
    describe("app", () => {
      const app = new Application({ id: "/test" });

      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.resetDelayedService(app);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/queue//test/delay`
        );
      });

      it("uses DELETE for the request method", () => {
        expect(thisConfiguration.method).toEqual("DELETE");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESET_DELAY_SUCCESS
          );
        });

        thisConfiguration.success({});
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESET_DELAY_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

    describe("pods", () => {
      const pod = new Pod({ id: "/test" });

      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.resetDelayedService(pod);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/queue//test/delay`
        );
      });

      it("uses DELETE for the request method", () => {
        expect(thisConfiguration.method).toEqual("DELETE");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESET_DELAY_SUCCESS
          );
        });

        thisConfiguration.success({});
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESET_DELAY_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

  describe("#restartService", () => {
    describe("app", () => {
      const app = new Application({ id: "/test" });

      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.restartService(app);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test/restart`
        );
      });

      it("sends data to the correct URL with the force=true parameter", () => {
        MarathonActions.restartService(app, true);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/apps//test/restart?force=true`
        );
      });

      it("uses POST for the request method", () => {
        expect(thisConfiguration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_SUCCESS
          );
        });

        thisConfiguration.success({});
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

    describe("pods", () => {
      const pod = new Pod({ id: "/test" });

      beforeEach(() => {
        spyOn(RequestUtil, "json");
        MarathonActions.restartService(pod);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test/restart`
        );
      });

      it("sends data to the correct URL with the force=true parameter", () => {
        MarathonActions.restartService(pod, true);
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/pods//test/restart?force=true`
        );
      });

      it("uses POST for the request method", () => {
        expect(thisConfiguration.method).toEqual("POST");
      });

      it("dispatches the correct action when successful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_SUCCESS
          );
        });

        thisConfiguration.success({});
      });

      it("dispatches the correct action when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_SERVICE_RESTART_ERROR
          );
        });

        thisConfiguration.error({ message: "error", response: "{}" });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
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

  describe("#fetchDeployments", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchDeployments();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/deployments`
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_SUCCESS
        );
      });

      thisConfiguration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: "/",
        version: "2001-01-01T01:01:01.001Z"
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_ERROR
        );
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#fetchGroups", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchGroups();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/groups`
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_GROUPS_SUCCESS
        );
      });

      thisConfiguration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: "/",
        version: "2016-05-02T16:07:32.583Z"
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_GROUPS_ERROR);
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#fetchQueue", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchQueue();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/queue`
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_QUEUE_SUCCESS);
      });

      thisConfiguration.success({
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

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_QUEUE_ERROR);
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#fetchServiceVersion", () => {
    const serviceID = "test";
    const versionID = "2016-05-02T16:07:32.583Z";

    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchServiceVersion(serviceID, versionID);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/apps/${serviceID}/versions/${versionID}`
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_SUCCESS
        );
      });

      thisConfiguration.success({
        serviceID,
        versionID,
        versions: ["2016-05-02T16:07:32.583Z"]
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_ERROR
        );
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#fetchServiceVersions", () => {
    const serviceID = "test";

    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchServiceVersions(serviceID);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/apps/${serviceID}/versions`
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS
        );
      });

      thisConfiguration.success({
        serviceID,
        versions: ["2016-05-02T16:07:32.583Z"]
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_ERROR
        );
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#fetchMarathonInstanceInfo", () => {
    const serviceID = "test";

    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.fetchMarathonInstanceInfo(serviceID);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        `${Config.rootUrl}/service/marathon/v2/info`
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_INSTANCE_INFO_SUCCESS
        );
        expect(action.data).toEqual({ foo: "bar", baz: "qux" });
      });

      thisConfiguration.success({ foo: "bar", baz: "qux" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_INSTANCE_INFO_ERROR
        );
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#revertDeployment", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.revertDeployment("deployment-id");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    describe("JSON request", () => {
      it("is made", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("is a DELETE", () => {
        expect(thisConfiguration.method).toEqual("DELETE");
      });

      it("calls the appropriate endpoint", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/deployments/deployment-id`
        );
      });
    });

    describe("on success", () => {
      it("emits a success event on success", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS
          );
        });

        thisConfiguration.success({});
      });

      it("emits the original deployment ID as the success payload", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.data.originalDeploymentID).toEqual("deployment-id");
        });

        thisConfiguration.success({});
      });
    });

    it("emits an error event on error", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR
        );
      });

      thisConfiguration.error({});
    });

    it("emits the original deployment ID in the error payload", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.originalDeploymentID).toEqual("deployment-id");
      });

      thisConfiguration.error({});
    });

    it("emits the response text in the error payload", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.error).toEqual({
          message: "A helpful error message."
        });
      });

      thisConfiguration.error({
        responseText: JSON.stringify({ message: "A helpful error message." })
      });
    });

    it("emits the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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

  describe("#killTasks", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      MarathonActions.killTasks(["task1", "task2"], false);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    describe("JSON request", () => {
      it("is made", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("is a POST", () => {
        expect(thisConfiguration.method).toEqual("POST");
      });

      it("calls the appropriate endpoint", () => {
        expect(thisConfiguration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/tasks/delete`
        );
      });

      it("calls the appropriate endpoint if scaled is true", () => {
        MarathonActions.killTasks(["task1", "task2"], true);
        const configuration = RequestUtil.json.calls.mostRecent().args[0];
        expect(configuration.url).toEqual(
          `${Config.rootUrl}/service/marathon/v2/tasks/delete?scale=true`
        );
      });
    });

    describe("on success", () => {
      it("emits a success event on success", () => {
        const id = AppDispatcher.register(payload => {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_MARATHON_TASK_KILL_SUCCESS
          );
        });

        thisConfiguration.success({});
      });
    });

    it("emits an error event on error", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_TASK_KILL_ERROR
        );
      });

      thisConfiguration.error({});
    });

    it("emits the response text in the error payload", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ message: "A helpful error message." });
      });

      thisConfiguration.error({
        responseText: JSON.stringify({ message: "A helpful error message." })
      });
    });

    it("emits the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
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
