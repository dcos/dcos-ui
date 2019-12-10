import SideTabs from "../SideTabs";

const React = require("react");

const ReactDOM = require("react-dom");

let thisTabs, thisContainer, thisInstance;

describe("SideTabs", () => {
  describe("#getTabs", () => {
    beforeEach(() => {
      thisTabs = [{ title: "Application" }, { title: "Host" }];
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <SideTabs selectedTab="Application" tabs={thisTabs} />,
        thisContainer
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("returns a list item for each tab", () => {
      var node = ReactDOM.findDOMNode(thisInstance);
      var items = node.querySelectorAll("li");
      expect(items.length).toEqual(thisTabs.length);
    });

    it("renders the selected tab with the 'selected' class", () => {
      var node = ReactDOM.findDOMNode(thisInstance);
      var selectedTab = node.querySelector(".selected");

      expect(selectedTab.textContent).toEqual("Application");
    });
  });
});
