jest.dontMock("../PackageDetailTab");
jest.dontMock("../../../components/FluidGeminiScrollbar");
jest.dontMock("../../../components/Page");
jest.dontMock("../../../components/Panel");
jest.dontMock("../../../mixins/InternalStorageMixin");
jest.dontMock("../../../components/modals/InstallPackageModal");
jest.dontMock("../../../stores/CosmosPackagesStore");
jest.dontMock("../../../../../tests/_fixtures/cosmos/package-describe.json");
jest.dontMock(
  "../../../../../tests/_fixtures/cosmos/package-list-versions.json"
);
jest.dontMock("#SRC/js/structs/UniversePackage.js");

const packageDescribeFixtures = require("../../../../../tests/_fixtures/cosmos/package-describe.json")
  .package;
const packageVersionsFixtures = require("../../../../../tests/_fixtures/cosmos/package-list-versions.json")
  .results;
const UniversePackage = require("#SRC/js/structs/UniversePackage.js");
var CosmosPackagesStore = require("../../../stores/CosmosPackagesStore");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const PackageDetailTab = require("../PackageDetailTab");

describe("PackageDetailTab", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <PackageDetailTab
        params={{ packageName: "marathon" }}
        location={{ query: { version: 1 } }}
      />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#retrievePackageInfo", function() {
    it("call fetchPackageVersions with package name", function() {
      CosmosPackagesStore.fetchPackageVersions = jasmine.createSpy(
        "fetchPackageVersions"
      );

      this.instance.retrievePackageInfo();
      expect(CosmosPackagesStore.fetchPackageVersions).toHaveBeenCalledWith(
        "marathon"
      );
    });
    it("call fetchPackageDescription with package name and package version", function() {
      CosmosPackagesStore.fetchPackageDescription = jasmine.createSpy(
        "fetchPackageDescription"
      );

      this.instance.retrievePackageInfo();
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
          this.instance.getItems([
            { label: "foo", value: null },
            { label: "bar", value: null }
          ]),
          this.instance.getItem
        ).toEqual([]);
      });

      it("returns only entries with defined values", function() {
        expect(
          this.instance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            this.instance.getItem
          ).length
        ).toEqual(1);
      });

      it("should render entries with keys and values", function() {
        var subItem = ReactDOM.render(
          this.instance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            this.instance.getItem
          )[0],
          this.container
        );

        expect(subItem.textContent).toEqual("foobaz");
      });
    });

    describe("#getSubItem", function() {
      it("returns empty array with only null values provided", function() {
        expect(
          this.instance.getItems([
            { label: "foo", value: null },
            { label: "bar", value: null }
          ]),
          this.instance.getSubItem
        ).toEqual([]);
      });

      it("returns only entries with defined values", function() {
        expect(
          this.instance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            this.instance.getSubItem
          ).length
        ).toEqual(1);
      });

      it("should render entries with keys and values", function() {
        var subItem = ReactDOM.render(
          this.instance.getItems(
            [{ label: "foo", value: "baz" }, { label: "bar", value: null }],
            this.instance.getSubItem
          )[0],
          this.container
        );

        expect(subItem.textContent).toEqual("foo: baz");
      });
    });
  });

  describe("#getSubItem", function() {
    it("should render link if url is defined", function() {
      var link = ReactDOM.render(
        this.instance.getSubItem("url", "http://foo"),
        this.container
      );

      expect(link.textContent).toEqual("url: http://foo");
      expect(link.querySelector("a").href).toEqual("http://foo/");
      expect(link.querySelector("a").tagName).toEqual("A");
    });

    it("should render link with prefix if defined", function() {
      var link = ReactDOM.render(
        this.instance.getSubItem("email", "foo@bar.com"),
        this.container
      );

      expect(link.textContent).toEqual("email: foo@bar.com");
      expect(link.querySelector("a").href).toEqual("mailto:foo@bar.com");
      expect(link.querySelector("a").tagName).toEqual("A");
    });
  });

  describe("#mapLicenses", function() {
    it("returns array for empty array", function() {
      expect(this.instance.mapLicenses([])).toEqual([]);
    });

    it("returns all entries of array", function() {
      var licenses = this.instance.mapLicenses([
        { name: "foo", url: "bar" },
        { name: "baz", url: "qux" },
        { name: "quux", url: "corge" }
      ]);

      expect(licenses.length).toEqual(3);
    });

    it("returns all entries even with undefined values", function() {
      var licenses = this.instance.mapLicenses([
        { name: "foo", url: "bar" },
        { name: "baz", url: null },
        { name: "quux", url: "corge" }
      ]);

      expect(licenses.length).toEqual(3);
    });
  });

  describe("#render", function() {
    it("should call getErrorScreen when error occurred", function() {
      this.instance.state.hasError = true;
      this.instance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      this.instance.render();
      expect(this.instance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", function() {
      this.instance.state.hasError = false;
      this.instance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      this.instance.render();
      expect(this.instance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("should call getLoadingScreen when loading", function() {
      this.instance.state.isLoading = true;
      this.instance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      this.instance.render();
      expect(this.instance.getLoadingScreen).toHaveBeenCalled();
    });

    it("should call getLoadingScreen when cosmosPackageVersions is null", function() {
      this.instance.state.isLoading = false;
      this.instance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      CosmosPackagesStore.getPackageDetails = jest.fn(() => {
        return true;
      });
      CosmosPackagesStore.getPackageVersions = function() {
        return null;
      };

      this.instance.render();
      expect(this.instance.getLoadingScreen).toHaveBeenCalled();
    });

    it("ignores getLoadingScreen when not loading", function() {
      this.instance.state.isLoading = false;
      this.instance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      CosmosPackagesStore.getPackageDetails = jest.fn(() => {
        return new UniversePackage(packageDescribeFixtures);
      });
      CosmosPackagesStore.getPackageVersions = jest.fn(() => {
        return new UniversePackage(packageVersionsFixtures);
      });

      this.instance.render();
      expect(this.instance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("ignores getLoadingScreen when error has occurred", function() {
      this.instance.state.hasError = true;
      this.instance.state.isLoading = true;
      this.instance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      this.instance.render();
      expect(this.instance.getLoadingScreen).not.toHaveBeenCalled();
    });
  });
});
