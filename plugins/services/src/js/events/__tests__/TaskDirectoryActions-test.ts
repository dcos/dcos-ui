import AppDispatcher from "#SRC/js/events/AppDispatcher";
import TaskDirectoryActions from "../TaskDirectoryActions";

import { RequestUtil } from "mesosphere-shared-reactjs";

import * as ActionTypes from "../../constants/ActionTypes";
import Config from "#SRC/js/config/Config";

let thisConfiguration,
  thisRequestUtilJSON,
  thisConfigRootUrl,
  thisConfigUseFixtures;

describe("TaskDirectoryActions", () => {
  beforeEach(() => {
    thisConfiguration = null;
    thisRequestUtilJSON = RequestUtil.json;
    RequestUtil.json = configuration => {
      thisConfiguration = configuration;
    };
    thisConfigRootUrl = Config.rootUrl;
    thisConfigUseFixtures = Config.useFixtures;
    Config.rootUrl = "";
    Config.useFixtures = false;
  });

  afterEach(() => {
    RequestUtil.json = thisRequestUtilJSON;
    Config.rootUrl = thisConfigRootUrl;
    Config.useFixtures = thisConfigUseFixtures;
  });

  describe("#fetchNodeState", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      TaskDirectoryActions.fetchNodeState(
        { framework_id: "foo", id: "bar", slave_id: "baz" },
        { pid: "foobar@baz", id: "baz" },
        "some/path"
      );
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        thisConfigRootUrl + "/agent/baz/foobar/state"
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_NODE_STATE_SUCCESS);
        expect(action.task.id).toEqual("bar");
        expect(action.node).toEqual({ pid: "foobar@baz", id: "baz" });
        expect(action.innerPath).toEqual("some/path");
        expect(action.data).toEqual("some response");
      });

      thisConfiguration.success("some response");
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_NODE_STATE_ERROR);
        expect(action.data).toEqual("foo");
        expect(action.task.id).toEqual("bar");
        expect(action.node).toEqual({ pid: "foobar@baz", id: "baz" });
      });

      thisConfiguration.error({ message: "foo" });
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

  describe("#fetchDirectory", () => {
    beforeEach(() => {
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

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        thisConfigRootUrl + "/agent/baz/files/browse"
      );
    });

    it("fetches data with path in data", () => {
      expect(thisConfiguration.data).toEqual({ path: "quis/" });
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_TASK_DIRECTORY_SUCCESS);
        expect(action.task.id).toEqual("bar");
        expect(action.innerPath).toEqual("");
        expect(action.data).toEqual("directory");
      });

      thisConfiguration.success("directory");
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_TASK_DIRECTORY_ERROR);
        expect(action.data).toEqual("foo");
        expect(action.task.id).toEqual("bar");
      });

      thisConfiguration.error({ message: "foo" });
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
