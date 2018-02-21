/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const SideTabs = require("../SideTabs");

let thisTabs, thisContainer, thisInstance;

describe("SideTabs", function() {
  describe("#getTabs", function() {
    beforeEach(function() {
      thisTabs = [{ title: "Application" }, { title: "Host" }];
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <SideTabs selectedTab="Application" tabs={thisTabs} />,
        thisContainer
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("returns a list item for each tab", function() {
      var node = ReactDOM.findDOMNode(thisInstance);
      var items = node.querySelectorAll("li");
      expect(items.length).toEqual(thisTabs.length);
    });

    it("renders the selected tab with the 'selected' class", function() {
      var node = ReactDOM.findDOMNode(thisInstance);
      var selectedTab = node.querySelector(".selected");

      expect(selectedTab.textContent).toEqual("Application");
    });
  });
});
