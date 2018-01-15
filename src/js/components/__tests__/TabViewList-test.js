const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TabView = require("../TabView");
const TabViewList = require("../TabViewList");

describe("TabViewList", function() {
  it("returns content of first child if no activeTab is defined", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabViewList>
        <TabView id="foo">foo</TabView>
        <TabView id="bar">bar</TabView>
        <TabView id="baz">baz</TabView>
      </TabViewList>
    );

    const node = ReactDOM.findDOMNode(this.instance);
    expect(node.textContent).toEqual("foo");
  });

  it("returns content of activeTab when defined", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabViewList activeTab="bar">
        <TabView id="foo">foo</TabView>
        <TabView id="bar">bar</TabView>
        <TabView id="baz">baz</TabView>
      </TabViewList>
    );

    const node = ReactDOM.findDOMNode(this.instance);
    expect(node.textContent).toEqual("bar");
  });
});
