import UniversePackage from "#SRC/js/structs/UniversePackage";
import UniversePackageVersions from "#SRC/js/structs/UniversePackageVersions";

import PackageDetailTab from "../PackageDetailTab";
import CosmosPackagesStore from "../../../stores/CosmosPackagesStore";

import packageDescribeFixtures from "../../../../../tests/_fixtures/cosmos/package-describe.json";

import * as React from "react";
import ReactDOM from "react-dom";

let thisContainer, thisInstance;

describe("PackageDetailTab", () => {
  beforeEach(() => {
    thisContainer = window.document.createElement("div");
    thisInstance = ReactDOM.render(
      <PackageDetailTab
        params={{ packageName: "marathon" }}
        location={{ query: { version: 1 } }}
      />,
      thisContainer
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#retrievePackageInfo", () => {
    it("call fetchPackageVersions with package name", () => {
      CosmosPackagesStore.fetchPackageVersions = jasmine.createSpy(
        "fetchPackageVersions"
      );

      thisInstance.retrievePackageInfo("marathon", 1);
      expect(CosmosPackagesStore.fetchPackageVersions).toHaveBeenCalledWith(
        "marathon"
      );
    });

    it("do NOT call fetchPackageVersions when package versions is cached", () => {
      CosmosPackagesStore.getPackageVersions = jest.fn(
        () =>
          new UniversePackageVersions({
            packageVersions: {
              "1": "1"
            }
          })
      );

      CosmosPackagesStore.fetchPackageVersions = jasmine.createSpy(
        "fetchPackageVersions"
      );

      thisInstance.retrievePackageInfo();
      expect(CosmosPackagesStore.fetchPackageVersions).not.toHaveBeenCalled();
    });

    it("call fetchPackageDescription with package name and package version", () => {
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

  describe("#getItems", () => {
    describe("#getItem", () => {
      it("returns empty array with null values provided", () => {
        expect(
          thisInstance.getItems.call(thisInstance, [
            { label: "foo", value: null },
            { label: "bar", value: null }
          ])
        ).toEqual([]);
      });

      it("returns only entries with defined values", () => {
        expect(
          thisInstance.getItems(
            [
              { label: "foo", value: "baz" },
              { label: "bar", value: null }
            ],
            thisInstance.getItem
          ).length
        ).toEqual(1);
      });

      it("renders entries with keys and values", () => {
        const subItem = ReactDOM.render(
          thisInstance.getItems(
            [
              { label: "foo", value: "baz" },
              { label: "bar", value: null }
            ],
            thisInstance.getItem
          )[0],
          thisContainer
        );

        expect(subItem.textContent).toEqual("foobaz");
      });
    });

    describe("#getSubItem", () => {
      it("returns empty array with only null values provided", () => {
        expect(
          thisInstance.getItems.call(thisInstance, [
            { label: "foo", value: null },
            { label: "bar", value: null }
          ])
        ).toEqual([]);
      });

      it("returns only entries with defined values", () => {
        expect(
          thisInstance.getItems(
            [
              { label: "foo", value: "baz" },
              { label: "bar", value: null }
            ],
            thisInstance.getSubItem
          ).length
        ).toEqual(1);
      });

      it("renders entries with keys and values", () => {
        const subItem = ReactDOM.render(
          thisInstance.getItems(
            [
              { label: "foo", value: "baz" },
              { label: "bar", value: null }
            ],
            thisInstance.getSubItem
          )[0],
          thisContainer
        );

        expect(subItem.textContent).toEqual("foo: baz");
      });
    });
  });

  describe("#getSubItem", () => {
    it("renders link if url is defined", () => {
      const link = ReactDOM.render(
        thisInstance.getSubItem("url", "http://foo"),
        thisContainer
      );

      expect(link.textContent).toEqual("url: http://foo");
      expect(link.querySelector("a").href).toEqual("http://foo/");
      expect(link.querySelector("a").tagName).toEqual("A");
    });

    it("renders link with prefix if defined", () => {
      const link = ReactDOM.render(
        thisInstance.getSubItem("email", "foo@bar.com"),
        thisContainer
      );

      expect(link.textContent).toEqual("email: foo@bar.com");
      expect(link.querySelector("a").href).toEqual("mailto:foo@bar.com");
      expect(link.querySelector("a").tagName).toEqual("A");
    });
  });

  describe("#mapLicenses", () => {
    it("returns array for empty array", () => {
      expect(thisInstance.mapLicenses([])).toEqual([]);
    });

    it("returns all entries of array", () => {
      const licenses = thisInstance.mapLicenses([
        { name: "foo", url: "bar" },
        { name: "baz", url: "qux" },
        { name: "quux", url: "corge" }
      ]);

      expect(licenses.length).toEqual(3);
    });

    it("returns all entries even with undefined values", () => {
      const licenses = thisInstance.mapLicenses([
        { name: "foo", url: "bar" },
        { name: "baz", url: null },
        { name: "quux", url: "corge" }
      ]);

      expect(licenses.length).toEqual(3);
    });
  });

  describe("#render", () => {
    it("calls getErrorScreen when error occurred", () => {
      thisInstance.state.hasError = true;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", () => {
      thisInstance.state.hasError = false;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("ignores getLoadingScreen when not loading", () => {
      thisInstance.isSelectedVersionLoading = () => false;
      thisInstance.state.isLoading = false;
      thisInstance.state.isLoadingSelectedVersion = false;
      thisInstance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      CosmosPackagesStore.getPackageDetails = jest.fn(
        () => new UniversePackage(packageDescribeFixtures.package)
      );

      thisInstance.render();
      expect(thisInstance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("ignores getLoadingScreen when error has occurred", () => {
      thisInstance.state.hasError = true;
      thisInstance.state.isLoading = true;
      thisInstance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      thisInstance.render();
      expect(thisInstance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("does not render stale data when the service is changed", () => {
      thisInstance.state.isLoadingSelectedVersion = true;
      expect(thisInstance.render()).toMatchSnapshot();
    });
  });
});
