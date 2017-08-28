jest.dontMock("../CosmosPackagesActions");
jest.dontMock("../AppDispatcher");
jest.dontMock("../../config/Config");
jest.dontMock("../../constants/ActionTypes");

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;
const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../AppDispatcher");
const CosmosPackagesActions = require("../CosmosPackagesActions");
const Config = require("../../config/Config");

describe("CosmosPackagesActions", function() {
  describe("#fetchAvailablePackages", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchAvailablePackages("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS
        );
      });

      this.configuration.success({ packages: [{ bar: "baz" }] });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual([{ bar: "baz", resource: {} }]);
      });

      this.configuration.success({ packages: [{ bar: "baz" }] });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ description: "bar" });
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/search"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({ query: "foo" });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchAvailablePackages();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(this.configuration.data)).toEqual({ query: undefined });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#fetchInstalledPackages", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchInstalledPackages("foo", "bar");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGES_LIST_SUCCESS
        );
      });

      this.configuration.success({
        packages: [
          {
            appId: "foo",
            packageInformation: {
              packageDefinition: { name: "bar" },
              resourceDefinition: { bar: "baz" }
            }
          }
        ]
      });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual([
          { appId: "foo", name: "bar", resource: { bar: "baz" } }
        ]);
      });

      this.configuration.success({
        packages: [
          {
            appId: "foo",
            packageInformation: {
              packageDefinition: { name: "bar" },
              resourceDefinition: { bar: "baz" }
            }
          }
        ]
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGES_LIST_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(Config.cosmosAPIPrefix + "/list");
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({
        packageName: "foo",
        appId: "bar"
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchInstalledPackages();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(this.configuration.data)).toEqual({
        packageName: undefined,
        appId: undefined
      });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#fetchPackageVersions", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchPackageVersions("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS
        );
      });

      this.configuration.success({
        results: {
          "1.0.2": "0"
        }
      });
    });

    it("dispatches with the correct data when successful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ "1.0.2": "0" });
      });

      this.configuration.success({
        results: {
          "1.0.2": "0"
        }
      });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_ERROR
        );
      });

      this.configuration.error({
        responseJSON: {
          results: {
            "1.0.2": "0"
          }
        }
      });
    });

    it("dispatches with error message when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("An error has occurred.");
      });

      this.configuration.error({
        responseJSON: {
          results: {
            "1.0.2": "0"
          }
        }
      });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          responseJSON: {
            results: {
              "1.0.2": "0"
            }
          }
        });
      });

      this.configuration.error({
        responseJSON: {
          results: {
            "1.0.2": "0"
          }
        }
      });
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/list-versions"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({
        packageName: "foo",
        includePackageVersions: false
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchPackageVersions();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(this.configuration.data)).toEqual({
        packageName: undefined,
        includePackageVersions: false
      });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#fetchPackageDescription", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchPackageDescription("foo", "bar");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS
        );
      });

      this.configuration.success({ package: { bar: "baz" } });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
      });

      this.configuration.success({ package: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/describe"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({
        packageName: "foo",
        packageVersion: "bar"
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchPackageDescription();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(this.configuration.data)).toEqual({
        packageName: undefined,
        packageVersion: undefined
      });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#installPackage", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.installPackage("foo", "bar", { baz: "qux" });
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS
        );
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.packageName).toEqual("foo");
        expect(action.packageVersion).toEqual("bar");
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_INSTALL_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
        expect(action.packageName).toEqual("foo");
        expect(action.packageVersion).toEqual("bar");
      });

      this.configuration.error({ responseJSON: "bar" });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/install"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({
        packageName: "foo",
        packageVersion: "bar",
        options: { baz: "qux" }
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.installPackage();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(this.configuration.data)).toEqual({ options: {} });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#uninstallPackage", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.uninstallPackage("foo", "bar", "baz", true);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS
        );
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.packageName).toEqual("foo");
        expect(action.packageVersion).toEqual("bar");
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR
        );
      });

      this.configuration.error({ responseJSON: "bar" });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      this.configuration.error({ responseJSON: "bar" });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/uninstall"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({
        appId: "baz",
        packageName: "foo",
        packageVersion: "bar",
        all: true
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.uninstallPackage();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(this.configuration.data)).toEqual({ all: false });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#fetchRepositories", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchRepositories({ foo: "bar" });
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS
        );
      });

      this.configuration.success({ repositories: [{ bar: "baz" }] });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual([{ bar: "baz" }]);
      });

      this.configuration.success({ repositories: [{ bar: "baz" }] });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORIES_LIST_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/repository/list"
      );
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#addRepository", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.addRepository("foo", "bar");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS
        );
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.name).toEqual("foo");
        expect(action.uri).toEqual("bar");
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_ADD_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/repository/add"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({
        name: "foo",
        uri: "bar"
      });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });

  describe("#deleteRepository", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.deleteRepository("foo", "bar");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS
        );
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.name).toEqual("foo");
        expect(action.uri).toEqual("bar");
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_DELETE_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.cosmosAPIPrefix + "/repository/delete"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(this.configuration.data)).toEqual({
        name: "foo",
        uri: "bar"
      });
    });

    it("sends a POST request", function() {
      expect(this.configuration.method).toEqual("POST");
    });
  });
});
