import ACLDirectoriesActions from "../ACLDirectoriesActions";

import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration, thisRequestUtilJSON;

describe("ACLDirectoriesActions", () => {
  beforeEach(() => {
    thisConfiguration = null;
    thisRequestUtilJSON = RequestUtil.json;
    RequestUtil.json = configuration => {
      thisConfiguration = configuration;
    };
    Config.rootUrl = "";
    Config.useFixtures = false;
  });

  afterEach(() => {
    RequestUtil.json = thisRequestUtilJSON;
  });

  describe("#fetchDirectories", () => {
    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.fetchDirectories();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.fetchDirectories();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/ldap/config"
      );
    });

    it("dispatches the correct action when successful", () => {
      ACLDirectoriesActions.fetchDirectories();

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORIES_SUCCESS,
          data: [{ foo: "bar" }]
        });
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      ACLDirectoriesActions.fetchDirectories();

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORIES_ERROR,
          data: "No LDAP configuration stored yet."
        });
      });

      thisConfiguration.error({
        responseJSON: {
          title: "Bad Request",
          description: "No LDAP configuration stored yet.",
          code: "ERR_LDAP_CONFIG_NOT_AVAILABLE"
        }
      });
    });
  });

  describe("#addDirectory", () => {
    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.addDirectory({ port: 1 });
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses PUT method", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.addDirectory({ port: 1 });
      expect(RequestUtil.json.calls.mostRecent().args[0].method).toEqual("PUT");
    });

    it("puts data to correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.addDirectory({ port: 1 });
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/ldap/config"
      );
    });

    it("dispatches the correct action when successful", () => {
      ACLDirectoriesActions.addDirectory({ port: 1 });

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_SUCCESS
        });
      });

      thisConfiguration.success();
    });

    it("dispatches the correct action when unsuccessful", () => {
      ACLDirectoriesActions.addDirectory({ port: 1 });

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_ERROR,
          data: "Foo"
        });
      });

      thisConfiguration.error({
        responseJSON: {
          description: "Foo"
        }
      });
    });
  });

  describe("#deleteDirectory", () => {
    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.deleteDirectory();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses DELETE method", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.deleteDirectory();
      expect(RequestUtil.json.calls.mostRecent().args[0].method).toEqual(
        "DELETE"
      );
    });

    it("puts data to correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.deleteDirectory();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/ldap/config"
      );
    });

    it("dispatches the correct action when successful", () => {
      ACLDirectoriesActions.deleteDirectory();

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_SUCCESS
        });
      });

      thisConfiguration.success();
    });

    it("dispatches the correct action when unsuccessful", () => {
      ACLDirectoriesActions.deleteDirectory();

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_ERROR,
          data: "Foo"
        });
      });

      thisConfiguration.error({
        responseJSON: {
          description: "Foo"
        }
      });
    });
  });

  describe("#testDirectoryConnection", () => {
    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.testDirectoryConnection();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses POST method", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.testDirectoryConnection();
      expect(RequestUtil.json.calls.mostRecent().args[0].method).toEqual(
        "POST"
      );
    });

    it("passes in credentials", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.testDirectoryConnection({
        uid: "foo",
        password: "bar"
      });
      expect(RequestUtil.json.calls.mostRecent().args[0].data).toEqual({
        uid: "foo",
        password: "bar"
      });
    });

    it("puts data to correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLDirectoriesActions.testDirectoryConnection();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/ldap/config/test"
      );
    });

    it("dispatches the correct action when successful", () => {
      ACLDirectoriesActions.testDirectoryConnection();

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_TEST_SUCCESS,
          data: { description: "foo" }
        });
      });

      thisConfiguration.success({ description: "foo" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      ACLDirectoriesActions.testDirectoryConnection();

      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_TEST_ERROR,
          data: "Foo"
        });
      });

      thisConfiguration.error({
        responseJSON: {
          description: "Foo"
        }
      });
    });
  });
});
