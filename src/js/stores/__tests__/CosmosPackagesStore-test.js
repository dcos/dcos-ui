const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const AppDispatcher = require("../../events/AppDispatcher");
const Config = require("#SRC/js/config/Config").default;
const EventTypes = require("../../constants/EventTypes");
const CosmosPackagesStore = require("../CosmosPackagesStore");
const packageDescribeFixture = require("./fixtures/MockPackageDescribeResponse.json");
const serviceDescribeFixture = require("./fixtures/MockServiceDescribeResponse.json");
const packagesListFixture = require("./fixtures/MockPackagesListResponse.json");
const packagesSearchFixture = require("./fixtures/MockPackagesSearchResponse.json");
const ActionTypes = require("../../constants/ActionTypes");
const UniversePackage = require("../../structs/UniversePackage");
const UniversePackageVersions = require("../../structs/UniversePackageVersions");
const UniverseInstalledPackagesList = require("../../structs/UniverseInstalledPackagesList");
const UniversePackagesList = require("../../structs/UniversePackagesList");

let thisConfigUseFixture,
  thisRequestFn,
  thisPackagesSearchFixture,
  thisPackageDescribeFixture,
  thisPackageListVersionsFixture;

describe("CosmosPackagesStore", () => {
  beforeEach(() => {
    thisConfigUseFixture = Config.useFixtures;
    Config.useFixtures = true;
  });

  afterEach(() => {
    Config.useFixtures = thisConfigUseFixture;
  });

  describe("#fetchAvailablePackages", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(Object.assign({}, packagesSearchFixture));
      };
      thisPackagesSearchFixture = Object.assign({}, packagesSearchFixture);
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns an instance of UniversePackagesList", () => {
      CosmosPackagesStore.fetchAvailablePackages("foo");
      var availablePackages = CosmosPackagesStore.getAvailablePackages();
      expect(availablePackages instanceof UniversePackagesList).toBeTruthy();
    });

    it("returns all of the availablePackages it was given", () => {
      CosmosPackagesStore.fetchAvailablePackages("foo");
      var availablePackages = CosmosPackagesStore.getAvailablePackages().getItems();
      expect(availablePackages.length).toEqual(
        thisPackagesSearchFixture.packages.length
      );
    });

    it("passes though query parameters", () => {
      RequestUtil.json = jasmine.createSpy("RequestUtil#json");
      CosmosPackagesStore.fetchAvailablePackages("foo");
      expect(
        JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data)
      ).toEqual({ query: "foo" });
    });

    describe("dispatcher", () => {
      it("stores availablePackages when event is dispatched", () => {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
          data: { packages: [{ gid: "foo", bar: "baz" }] },
          query: "foo"
        });

        var availablePackages = CosmosPackagesStore.getAvailablePackages().getItems();
        expect(availablePackages[0].get("gid")).toEqual("foo");
        expect(availablePackages[0].get("bar")).toEqual("baz");
      });

      it("stores packageImages when event is dispatched", () => {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
          data: { images: { gid: "foo", bar: "baz" } },
          query: "foo"
        });

        var packageImages = CosmosPackagesStore.getPackageImages();
        expect(packageImages["gid"]).toEqual("foo");
        expect(packageImages["bar"]).toEqual("baz");
      });

      it("dispatches the correct event upon success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_SEARCH_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
          data: { packages: [{ gid: "foo", bar: "baz" }] },
          query: "foo"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        var mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_SEARCH_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGES_SEARCH_ERROR,
          data: "error",
          query: "foo"
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(["error", "foo"]);
      });
    });
  });

  describe("#fetchPackageDescription", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(Object.assign({}, packageDescribeFixture));
      };
      thisPackageDescribeFixture = Object.assign({}, packageDescribeFixture);
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns an instance of UniversePackage", () => {
      CosmosPackagesStore.fetchPackageDescription("foo", "bar");
      var packageDetails = CosmosPackagesStore.getPackageDetails();
      expect(packageDetails instanceof UniversePackage).toBeTruthy();
    });

    it("returns the packageDetails it was given", () => {
      CosmosPackagesStore.fetchPackageDescription("foo", "bar");
      var pkg = CosmosPackagesStore.getPackageDetails();
      expect(pkg.getName()).toEqual(thisPackageDescribeFixture.package.name);
      expect(pkg.getVersion()).toEqual(
        thisPackageDescribeFixture.package.version
      );
    });

    it("passes though query parameters", () => {
      RequestUtil.json = jasmine.createSpy("RequestUtil#json");
      CosmosPackagesStore.fetchPackageDescription("foo", "bar");
      expect(
        JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data)
      ).toEqual({ packageName: "foo", packageVersion: "bar" });
    });

    describe("dispatcher", () => {
      it("stores packageDetails when event is dispatched", () => {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
          data: { gid: "foo", bar: "baz" },
          packageName: "foo",
          packageVersion: "bar"
        });

        var pkg = CosmosPackagesStore.getPackageDetails();
        expect(pkg.get("gid")).toEqual("foo");
        expect(pkg.get("bar")).toEqual("baz");
      });

      it("dispatches the correct event upon success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_PACKAGE_DESCRIBE_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
          data: { gid: "foo", bar: "baz" },
          packageName: "foo",
          packageVersion: "bar"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        var mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_PACKAGE_DESCRIBE_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR,
          data: "error",
          packageName: "foo",
          packageVersion: "bar"
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual([
          "error",
          "foo",
          "bar"
        ]);
      });
    });
  });

  describe("#fetchPackageVersions", () => {
    const packageVersions = {
      results: {
        "0.4.0": "2",
        "0.3.0": "1",
        "0.2.1": "0"
      }
    };

    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(Object.assign({}, packageVersions));
      };
      thisPackageListVersionsFixture = Object.assign({}, packageVersions);
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns an instance of UniversePackage", () => {
      CosmosPackagesStore.fetchPackageVersions("foo");
      const packageVersions = CosmosPackagesStore.getPackageVersions("foo");
      expect(packageVersions instanceof UniversePackageVersions).toBeTruthy();
    });

    it("returns an null if packageName not in packageVersions", () => {
      CosmosPackagesStore.fetchPackageVersions("foo");
      const packageVersions = CosmosPackagesStore.getPackageVersions("bar");
      expect(packageVersions).toEqual(null);
    });

    it("returns all package versions it was given", () => {
      const packageName = "foo";
      CosmosPackagesStore.fetchPackageVersions(packageName);
      const versions = CosmosPackagesStore.getPackageVersions("foo");
      expect(Object.keys(versions.getVersions()).length).toEqual(
        Object.keys(thisPackageListVersionsFixture.results).length
      );
    });

    it("send correct body", () => {
      RequestUtil.json = jasmine.createSpy("RequestUtil#json");
      CosmosPackagesStore.fetchPackageVersions("foo");
      expect(
        JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data)
      ).toEqual({
        packageName: "foo",
        includePackageVersions: false
      });
    });

    describe("dispatcher", () => {
      it("stores packageVersions and packageName when event is dispatched", () => {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS,
          data: {
            "0.4.0": "2",
            "0.3.0": "1",
            "0.2.1": "0"
          },
          packageName: "foo"
        });

        expect(CosmosPackagesStore.getPackageVersions("foo").get()).toEqual({
          packageVersions: {
            "0.3.0": "1",
            "0.4.0": "2",
            "0.2.1": "0"
          }
        });
      });

      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_LIST_VERSIONS_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS,
          data: {
            "0.4.0": "2",
            "0.3.0": "1",
            "0.2.1": "0"
          }
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_LIST_VERSIONS_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_ERROR,
          data: "error"
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(["error"]);
      });
    });
  });

  describe("#fetchServiceDescription", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(Object.assign({}, serviceDescribeFixture));
      };
      Object.assign({}, serviceDescribeFixture);
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns the field package within response", () => {
      CosmosPackagesStore.fetchServiceDescription("foo");
      var response = CosmosPackagesStore.getServiceDetails();
      var packageField = response.package;
      expect(packageField.name).toEqual("marathon");
    });

    it("returns the field resolvedOptions within the response", () => {
      CosmosPackagesStore.fetchServiceDescription("foo");
      var response = CosmosPackagesStore.getServiceDetails();
      var resolvedOptions = response.resolvedOptions;
      expect(resolvedOptions.name).toEqual("marathon-1");
    });

    it("returns the field userProvidedOptions within the response", () => {
      CosmosPackagesStore.fetchServiceDescription("foo");
      var response = CosmosPackagesStore.getServiceDetails();
      var userOptions = response.userProvidedOptions;
      expect(userOptions.name).toEqual("marathon-1");
    });

    it("passes though query parameters", () => {
      RequestUtil.json = jasmine.createSpy("RequestUtil#json");
      CosmosPackagesStore.fetchServiceDescription("foo");
      expect(
        JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data)
      ).toEqual({ appId: "foo" });
    });

    describe("dispatcher", () => {
      it("stores packageDetails when event is dispatched", () => {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_SERVICE_DESCRIBE_SUCCESS,
          data: { gid: "foo", bar: "baz" },
          serviceId: "foo"
        });

        var serviceDetails = CosmosPackagesStore.getServiceDetails();
        expect(serviceDetails["gid"]).toEqual("foo");
        expect(serviceDetails["bar"]).toEqual("baz");
      });

      it("dispatches the correct event upon success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_SERVICE_DESCRIBE_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_SERVICE_DESCRIBE_SUCCESS,
          data: { gid: "foo", bar: "baz" },
          serviceId: "foo"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        var mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_SERVICE_DESCRIBE_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_SERVICE_DESCRIBE_ERROR,
          data: "error",
          serviceId: "foo"
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(["error", "foo"]);
      });
    });
  });

  describe("#updateService", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(Object.assign({}, packageDescribeFixture));
      };
      thisPackageDescribeFixture = Object.assign({}, packageDescribeFixture);
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("passes though query parameters", () => {
      RequestUtil.json = jasmine.createSpy("RequestUtil#json");
      CosmosPackagesStore.updateService("foo", { cpus: 3 });
      expect(
        JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data)
      ).toEqual({ appId: "foo", options: { cpus: 3 }, replace: true });
    });

    describe("dispatcher", () => {
      it("dispatches the correct event upon success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_SERVICE_UPDATE_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_SERVICE_UPDATE_SUCCESS
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        var mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_SERVICE_UPDATE_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_SERVICE_UPDATE_ERROR
        });

        expect(mockedFn.calls.count()).toEqual(1);
      });
    });
  });

  describe("#fetchInstalledPackages", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(Object.assign({}, packagesListFixture));
      };
      Object.assign({}, packagesListFixture);
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns an instance of UniverseInstalledPackagesList", () => {
      CosmosPackagesStore.fetchInstalledPackages("foo", "bar");
      var installedPackages = CosmosPackagesStore.getInstalledPackages();
      expect(
        installedPackages instanceof UniverseInstalledPackagesList
      ).toBeTruthy();
    });

    it("returns all of the installedPackages it was given", () => {
      CosmosPackagesStore.fetchInstalledPackages("foo", "bar");
      var installedPackages = CosmosPackagesStore.getInstalledPackages().getItems();
      expect(installedPackages.length).toEqual(2);
    });

    it("stores the installedPackages it was given", () => {
      CosmosPackagesStore.fetchInstalledPackages("foo", "bar");
      var installedPackages = CosmosPackagesStore.getInstalledPackages().getItems();
      expect(installedPackages[0].getName()).toEqual("marathon");
      expect(installedPackages[0].getAppId()).toEqual("/marathon-user");
    });

    it("passes though query parameters", () => {
      RequestUtil.json = jasmine.createSpy("RequestUtil#json");
      CosmosPackagesStore.fetchInstalledPackages("foo", "bar");
      expect(
        JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data)
      ).toEqual({ packageName: "foo", appId: "bar" });
    });

    describe("dispatcher", () => {
      it("stores installedPackages when event is dispatched", () => {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
          data: [{ appId: "bar", gid: "foo", bar: "baz" }],
          packageName: "foo",
          appId: "bar"
        });

        var installedPackages = CosmosPackagesStore.getInstalledPackages().getItems();
        expect(installedPackages[0].get("gid")).toEqual("foo");
        expect(installedPackages[0].get("bar")).toEqual("baz");
        expect(installedPackages[0].get("appId")).toEqual("bar");
      });

      it("dispatches the correct event upon success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_LIST_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
          data: [{ appId: "bar", gid: "foo", bar: "baz" }],
          packageName: "foo",
          appId: "baz"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        var mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_LIST_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGES_LIST_ERROR,
          data: "error",
          packageName: "foo",
          appId: "bar"
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual([
          "error",
          "foo",
          "bar"
        ]);
      });
    });
  });

  describe("#installPackage", () => {
    describe("dispatcher", () => {
      it("dispatches the correct event upon success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_INSTALL_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS,
          data: [{ foo: "bar" }],
          packageName: "foo",
          packageVersion: "bar"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        var mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_INSTALL_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_INSTALL_ERROR,
          data: "error",
          packageName: "foo",
          packageVersion: "bar"
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual([
          "error",
          "foo",
          "bar"
        ]);
      });
    });
  });

  describe("#uninstallPackage", () => {
    describe("dispatcher", () => {
      it("dispatches the correct event upon success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_UNINSTALL_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
          data: [{ foo: "bar" }],
          packageName: "foo",
          packageVersion: "bar",
          appId: "baz"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        var mockedFn = jasmine.createSpy("mockedFn");
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_UNINSTALL_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
          data: "error",
          packageName: "foo",
          packageVersion: "bar",
          appId: "baz"
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual([
          "error",
          "foo",
          "bar",
          "baz"
        ]);
      });
    });
  });

  describe("#processRepositoriesSuccess", () => {
    beforeEach(() => {
      CosmosPackagesStore.processRepositoriesSuccess([
        { foo: "bar" },
        { baz: "qux" }
      ]);
    });

    it("stores repositories", () => {
      var repos = CosmosPackagesStore.getRepositories();
      expect(repos.getItems().length).toEqual(2);
    });
  });

  describe("dispatcher", () => {
    describe("repositories fetch", () => {
      it("dispatches the correct event on success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_REPOSITORIES_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS,
          data: [{ foo: "bar" }]
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event on error", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_REPOSITORIES_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_REPOSITORIES_LIST_ERROR,
          data: { foo: "bar" },
          name: "baz",
          uri: "qux"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual([{ foo: "bar" }]);
      });
    });

    describe("repository add", () => {
      it("dispatches the correct event on success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_REPOSITORY_ADD_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS,
          data: { foo: "bar" },
          name: "baz",
          uri: "qux"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual([{ foo: "bar" }, "baz", "qux"]);
      });

      it("dispatches the correct event on error", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_REPOSITORY_ADD_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_REPOSITORY_ADD_ERROR,
          data: { foo: "bar" },
          name: "baz",
          uri: "qux"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual([{ foo: "bar" }, "baz", "qux"]);
      });
    });

    describe("repository delete", () => {
      it("dispatches the correct event on success", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_REPOSITORY_DELETE_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS,
          data: { foo: "bar" },
          name: "baz",
          uri: "qux"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual([{ foo: "bar" }, "baz", "qux"]);
      });

      it("dispatches the correct event on error", () => {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          EventTypes.COSMOS_REPOSITORY_DELETE_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_COSMOS_REPOSITORY_DELETE_ERROR,
          data: { foo: "bar" },
          name: "baz",
          uri: "qux"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual([{ foo: "bar" }, "baz", "qux"]);
      });
    });
  });
});
