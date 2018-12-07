import { of, throwError } from "rxjs";

jest.mock("@dcos/http-service");
const httpService = require("@dcos/http-service");
const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;
const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../AppDispatcher");
const CosmosPackagesActions = require("../CosmosPackagesActions");
const Config = require("#SRC/js/config/Config").default;

let thisConfiguration;

describe("CosmosPackagesActions", function() {
  describe("#fetchAvailablePackages", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchAvailablePackages("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS
        );
      });

      thisConfiguration.success({ packages: [{ bar: "baz" }] });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({
          images: { undefined },
          packages: [{ bar: "baz", resource: {} }]
        });
      });

      thisConfiguration.success({ packages: [{ bar: "baz" }] });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ description: "bar" });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(Config.cosmosAPIPrefix + "/search");
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({ query: "foo" });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchAvailablePackages();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(thisConfiguration.data)).toEqual({ query: undefined });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#fetchInstalledPackages", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchInstalledPackages("foo", "bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGES_LIST_SUCCESS
        );
      });

      thisConfiguration.success({
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

      thisConfiguration.success({
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

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(Config.cosmosAPIPrefix + "/list");
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        packageName: "foo",
        appId: "bar"
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchInstalledPackages();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        packageName: undefined,
        appId: undefined
      });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#fetchPackageVersions", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchPackageVersions("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS
        );
      });

      thisConfiguration.success({
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

      thisConfiguration.success({
        results: {
          "1.0.2": "0"
        }
      });
    });

    it("dispatches with the correct package name when successful", function() {
      const id = AppDispatcher.register(function(payload) {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.packageName).toEqual("foo");
      });

      thisConfiguration.success({
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

      thisConfiguration.error({
        responseJSON: {
          description: "not able to finish the request"
        }
      });
    });

    it("dispatches with error message when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("not able to finish the request");
      });

      thisConfiguration.error({
        responseJSON: {
          description: "not able to finish the request"
        }
      });
    });

    it("dispatches the package name when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.packageName).toEqual("foo");
      });

      thisConfiguration.error({
        responseJSON: {
          description: "not able to finish the request"
        }
      });
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

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        Config.cosmosAPIPrefix + "/list-versions"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        packageName: "foo",
        includePackageVersions: false
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchPackageVersions();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        packageName: undefined,
        includePackageVersions: false
      });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#fetchPackageDescription", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchPackageDescription("foo", "bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS
        );
      });

      thisConfiguration.success({ package: { bar: "baz" } });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
      });

      thisConfiguration.success({ package: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        Config.cosmosAPIPrefix + "/describe"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        packageName: "foo",
        packageVersion: "bar"
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchPackageDescription();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        packageName: undefined,
        packageVersion: undefined
      });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#fetchServiceDescription", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.fetchServiceDescription("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_SERVICE_DESCRIBE_SUCCESS
        );
      });

      thisConfiguration.success({ package: { bar: "baz" } });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ package: { bar: "baz" } });
      });

      thisConfiguration.success({ package: { bar: "baz" } });
    });

    it("dispatches with serviceId when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.serviceId).toEqual("foo");
      });

      thisConfiguration.success({ package: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_SERVICE_DESCRIBE_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with serviceId when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.serviceId).toEqual("foo");
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual("/cosmos/service/describe");
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        appId: "foo"
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.fetchPackageDescription();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        appId: undefined
      });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#updateService", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.updateService("foo", { cpus: 3 });
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_SERVICE_UPDATE_SUCCESS
        );
      });

      thisConfiguration.success({ package: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_SERVICE_UPDATE_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ description: "bar" });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual("/cosmos/service/update");
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        appId: "foo",
        options: { cpus: 3 },
        replace: true
      });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#installPackage", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.installPackage("foo", "bar", { baz: "qux" });
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS
        );
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.packageName).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_INSTALL_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
        expect(action.packageName).toEqual("foo");
        expect(action.packageVersion).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: "bar" });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        Config.cosmosAPIPrefix + "/install"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        packageName: "foo",
        packageVersion: "bar",
        options: { baz: "qux" }
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.installPackage();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(thisConfiguration.data)).toEqual({ options: {} });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#uninstallPackage", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      CosmosPackagesActions.uninstallPackage("foo", "baz", true);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS
        );
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.packageName).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: "bar" });
    });

    it("dispatches with the correct data when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: "bar" });
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

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        Config.cosmosAPIPrefix + "/uninstall"
      );
    });

    it("sends query in request body", function() {
      expect(JSON.parse(thisConfiguration.data)).toEqual({
        appId: "baz",
        packageName: "foo",
        all: true
      });
    });

    it("sends query in request body, even if it is undefined", function() {
      CosmosPackagesActions.uninstallPackage();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      expect(JSON.parse(thisConfiguration.data)).toEqual({ all: false });
    });

    it("sends a POST request", function() {
      expect(thisConfiguration.method).toEqual("POST");
    });
  });

  describe("#fetchRepositories", function() {
    it("dispatches the correct action when successful", function(done) {
      httpService.request.mockReturnValueOnce(
        of({ repositories: [{ bar: "baz" }] })
      );

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS
        );
        done();
      });

      CosmosPackagesActions.fetchRepositories();
    });

    it("dispatches with the correct data when successful", function(done) {
      httpService.request.mockReturnValueOnce(
        of({ repositories: [{ bar: "baz" }] })
      );

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual([{ bar: "baz" }]);
        done();
      });

      CosmosPackagesActions.fetchRepositories();
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      httpService.request.mockReturnValueOnce(
        throwError({ responseJSON: { description: "bar" } })
      );

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORIES_LIST_ERROR
        );
        done();
      });

      CosmosPackagesActions.fetchRepositories();
    });

    it("dispatches with the correct data when unsuccessful", function(done) {
      httpService.request.mockReturnValueOnce(
        throwError({ response: { description: "bar" } })
      );

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
        done();
      });

      CosmosPackagesActions.fetchRepositories();
    });
  });

  describe("#addRepository", function() {
    it.skip("dispatches the correct action when successful", function(done) {
      httpService.request.mockReturnValueOnce(of({ bar: "baz" }));

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS
        );
        done();
      });

      CosmosPackagesActions.addRepository("foo", "bar", 1);
    });

    it.skip("dispatches with the correct data when successful", function(done) {
      httpService.request.mockReturnValueOnce(of({ bar: "baz" }));

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.name).toEqual("foo");
        expect(action.uri).toEqual("bar");
        done();
      });

      CosmosPackagesActions.addRepository("foo", "bar", 1);
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      httpService.request.mockReturnValueOnce(
        throwError({ responseJSON: { description: "bar" } })
      );
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_ADD_ERROR
        );
        done();
      });

      CosmosPackagesActions.addRepository("foo", "bar", 1);
    });

    it("dispatches with the correct data when unsuccessful", function(done) {
      httpService.request.mockReturnValueOnce(
        throwError({ response: { description: "bar" } })
      );

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
        done();
      });

      CosmosPackagesActions.addRepository("foo", "bar", 1);
    });
  });

  describe("#deleteRepository", function() {
    it.skip("dispatches the correct action when successful", function(done) {
      httpService.request.mockReturnValueOnce(of([""]));

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS
        );
        done();
      });

      CosmosPackagesActions.deleteRepository("foo", "bar");
    });

    it.skip("dispatches with the correct data when successful", function(done) {
      httpService.request.mockReturnValueOnce(of({ bar: "baz" }));

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ bar: "baz" });
        expect(action.name).toEqual("foo");
        expect(action.uri).toEqual("bar");
        done();
      });

      CosmosPackagesActions.deleteRepository("foo", "bar");
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      httpService.request.mockReturnValueOnce(
        throwError({ response: { description: "bar" } })
      );

      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_COSMOS_REPOSITORY_DELETE_ERROR
        );
        done();
      });

      CosmosPackagesActions.deleteRepository("foo", "bar");
    });

    it("dispatches with the correct data when unsuccessful", function(done) {
      httpService.request.mockReturnValueOnce(
        throwError({ response: { description: "bar" } })
      );
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
        done();
      });

      CosmosPackagesActions.deleteRepository("foo", "bar");
    });
  });
});
