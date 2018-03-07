jest.mock("../../../utils/ScrollbarUtil");
jest.mock("../../../components/Page", function() {
  const Page = ({ children }) => <div>{children}</div>;
  Page.Header = ({ children }) => <div>{children}</div>;

  return Page;
});

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

// Setting useFixtures for when we load CosmosPackagesStore/CosmosPackageActions
/* eslint-disable import/newline-after-import */
const Config = require("../../../config/Config");
var configUseFixtures = Config.useFixtures;
Config.useFixtures = true;
const CosmosPackagesStore = require("../../../stores/CosmosPackagesStore");
Config.useFixtures = configUseFixtures;
/* eslint-enable import/newline-after-import */

const PackagesTab = require("../PackagesTab");
const UniversePackagesList = require("../../../structs/UniversePackagesList");

const renderer = require("react-test-renderer");

let thisContainer,
  thisInstance,
  thisCosmosPackagesStoreGetAvailablePackages,
  thisPackages,
  thisGetAvailablePackages,
  thisFetchAvailablePackages;

describe("PackagesTab", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(<PackagesTab />, thisContainer);
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#handleDetailOpen", function() {
    beforeEach(function() {
      thisInstance.handleDetailOpen = jasmine.createSpy("handleDetailOpen");
      jest.runAllTimers();
    });

    it("calls handler when panel is clicked", function() {
      var panel = ReactDOM.findDOMNode(thisInstance).querySelector(
        ".panel.clickable"
      );
      TestUtils.Simulate.click(panel);

      expect(
        thisInstance.handleDetailOpen.calls.mostRecent().args[0].get("name")
      ).toEqual("arangodb3");
    });
  });

  describe("#getPackageGrid", function() {
    beforeEach(function() {
      thisCosmosPackagesStoreGetAvailablePackages =
        CosmosPackagesStore.getAvailablePackages;
      thisPackages = CosmosPackagesStore.getAvailablePackages();
    });

    afterEach(function() {
      CosmosPackagesStore.getAvailablePackages = thisCosmosPackagesStoreGetAvailablePackages;
    });

    it("returns packages", function() {
      expect(thisInstance.getPackageGrid(thisPackages).length).toEqual(97);
    });

    it("doesn't return packages", function() {
      CosmosPackagesStore.getAvailablePackages = function() {
        return new UniversePackagesList();
      };

      const packages = CosmosPackagesStore.getAvailablePackages();
      expect(thisInstance.getPackageGrid(packages).length).toEqual(0);
    });
  });

  describe("with empty state", function() {
    beforeEach(function() {
      thisGetAvailablePackages = CosmosPackagesStore.getAvailablePackages;
      thisFetchAvailablePackages = CosmosPackagesStore.fetchAvailablePackages;
      CosmosPackagesStore.getAvailablePackages = () => {
        return new UniversePackagesList();
      };
      CosmosPackagesStore.fetchAvailablePackages = () => {};
    });

    afterEach(function() {
      CosmosPackagesStore.getAvailablePackages = thisGetAvailablePackages;
      CosmosPackagesStore.fetchAvailablePackages = thisFetchAvailablePackages;
    });

    it("displays AlertPanel with action to Package Repositories", function() {
      thisInstance = renderer.create(<PackagesTab />);
      thisInstance.getInstance().onCosmosPackagesStoreAvailableSuccess();

      var tree = thisInstance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe("with packages on the list", function() {
    it("displays the catalog with packages", function() {
      thisInstance = renderer.create(<PackagesTab />);
      thisInstance.getInstance().onCosmosPackagesStoreAvailableSuccess();

      var tree = thisInstance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
