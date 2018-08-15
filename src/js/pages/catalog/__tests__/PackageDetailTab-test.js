const packageDescribeFixtures = require("../../../../../tests/_fixtures/cosmos/package-describe.json")
  .package;
const UniversePackage = require("#SRC/js/structs/UniversePackage");
const UniversePackageVersions = require("#SRC/js/structs/UniversePackageVersions");
var CosmosPackagesStore = require("../../../stores/CosmosPackagesStore");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const PackageDetailTab = require("../PackageDetailTab");

let thisContainer, thisInstance;

describe("PackageDetailTab", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <PackageDetailTab
        params={{ packageName: "marathon" }}
        location={{ query: { version: 1 } }}
      />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#retrievePackageInfo", function() {
    it("call fetchPackageVersions with package name", function() {
      CosmosPackagesStore.fetchPackageVersions = jasmine.createSpy(
        "fetchPackageVersions"
      );

      thisInstance.retrievePackageInfo("marathon", 1);
      expect(CosmosPackagesStore.fetchPackageVersions).toHaveBeenCalledWith(
        "marathon"
      );
    });

    it("do NOT call fetchPackageVersions when package versions is cached", function() {
      CosmosPackagesStore.getPackageVersions = jest.fn(() => {
        return new UniversePackageVersions({
          packageVersions: {
            "1": "1"
          }
        });
      });

      CosmosPackagesStore.fetchPackageVersions = jasmine.createSpy(
        "fetchPackageVersions"
      );

      thisInstance.retrievePackageInfo();
      expect(CosmosPackagesStore.fetchPackageVersions).not.toHaveBeenCalled();
    });

    it("call fetchPackageDescription with package name and package version", function() {
      CosmosPackagesStore.fetchPackageDescription = jasmine.createSpy(
        "fetchPackageDescription"
      );

      thisInstance.retrievePackageInfo("marathon", 1);
      expect(CosmosPackagesStore.fetchPackageDescription).toHaveBeenCalledWith(
        "marathon",
        1
      );
    });
  });

  describe("#getItems", function() {
    describe("#getItem", function() {
      it("returns empty array with null values provided", function() {
        expect(
          thisInstance.getItems.call(thisInstance, [
            { label: "foo", value: null },
            { label: "bar", value: null }
          ])
        ).toEqual([]);
      });

      it("returns only entries with defined values", function() {
        expect(
          thisInstance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            thisInstance.getItem
          ).length
        ).toEqual(1);
      });

      it("renders entries with keys and values", function() {
        var subItem = ReactDOM.render(
          thisInstance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            thisInstance.getItem
          )[0],
          thisContainer
        );

        expect(subItem.textContent).toEqual("foobaz");
      });
    });

    describe("#getSubItem", function() {
      it("returns empty array with only null values provided", function() {
        expect(
          thisInstance.getItems.call(thisInstance, [
            { label: "foo", value: null },
            { label: "bar", value: null }
          ])
        ).toEqual([]);
      });

      it("returns only entries with defined values", function() {
        expect(
          thisInstance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            thisInstance.getSubItem
          ).length
        ).toEqual(1);
      });

      it("renders entries with keys and values", function() {
        var subItem = ReactDOM.render(
          thisInstance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            thisInstance.getSubItem
          )[0],
          thisContainer
        );

        expect(subItem.textContent).toEqual("foo: baz");
      });
    });
  });

  describe("#getSubItem", function() {
    it("renders link if url is defined", function() {
      var link = ReactDOM.render(
        thisInstance.getSubItem("url", "http://foo"),
        thisContainer
      );

      expect(link.textContent).toEqual("url: http://foo");
      expect(link.querySelector("a").href).toEqual("http://foo/");
      expect(link.querySelector("a").tagName).toEqual("A");
    });

    it("renders link with prefix if defined", function() {
      var link = ReactDOM.render(
        thisInstance.getSubItem("email", "foo@bar.com"),
        thisContainer
      );

      expect(link.textContent).toEqual("email: foo@bar.com");
      expect(link.querySelector("a").href).toEqual("mailto:foo@bar.com");
      expect(link.querySelector("a").tagName).toEqual("A");
    });
  });

  describe("#mapLicenses", function() {
    it("returns array for empty array", function() {
      expect(thisInstance.mapLicenses([])).toEqual([]);
    });

    it("returns all entries of array", function() {
      var licenses = thisInstance.mapLicenses([
        { name: "foo", url: "bar" },
        { name: "baz", url: "qux" },
        { name: "quux", url: "corge" }
      ]);

      expect(licenses.length).toEqual(3);
    });

    it("returns all entries even with undefined values", function() {
      var licenses = thisInstance.mapLicenses([
        { name: "foo", url: "bar" },
        { name: "baz", url: null },
        { name: "quux", url: "corge" }
      ]);

      expect(licenses.length).toEqual(3);
    });
  });

  describe("#render", function() {
    it("calls getErrorScreen when error occurred", function() {
      thisInstance.state.hasError = true;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", function() {
      thisInstance.state.hasError = false;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("calls getLoadingScreen when loading", function() {
      thisInstance.state.isLoading = true;
      thisInstance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      thisInstance.render();
      expect(thisInstance.getLoadingScreen).toHaveBeenCalled();
    });

    it("ignores getLoadingScreen when not loading", function() {
      thisInstance.isSelectedVersionLoading = function() {
        return false;
      };
      thisInstance.state.isLoading = false;
      thisInstance.state.isLoadingSelectedVersion = false;
      thisInstance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      CosmosPackagesStore.getPackageDetails = jest.fn(() => {
        return new UniversePackage(packageDescribeFixtures);
      });

      thisInstance.render();
      expect(thisInstance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("ignores getLoadingScreen when error has occurred", function() {
      thisInstance.state.hasError = true;
      thisInstance.state.isLoading = true;
      thisInstance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      thisInstance.render();
      expect(thisInstance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("does not render stale data when the service is changed", function() {
      thisInstance.state.isLoadingSelectedVersion = true;
      expect(thisInstance.render()).toMatchSnapshot();
    });
  });
});
