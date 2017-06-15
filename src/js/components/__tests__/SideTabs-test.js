jest.dontMock("../SideTabs");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const SideTabs = require("../SideTabs");

describe("SideTabs", function() {
  describe("#getTabs", function() {
    beforeEach(function() {
      this.tabs = [{ title: "Application" }, { title: "Host" }];
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <SideTabs selectedTab="Application" tabs={this.tabs} />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("returns a list item for each tab", function() {
      var node = ReactDOM.findDOMNode(this.instance);
      var items = node.querySelectorAll("li");
      expect(items.length).toEqual(this.tabs.length);
    });

    it("renders the selected tab with the 'selected' class", function() {
      var node = ReactDOM.findDOMNode(this.instance);
      var selectedTab = node.querySelector(".selected");

      expect(selectedTab.textContent).toEqual("Application");
    });
  });
});
