jest.dontMock("../CollapsingPanel");
jest.dontMock("../CollapsingPanelContent");
jest.dontMock("../CollapsingPanelHeader");

const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const CollapsingPanel = require("../CollapsingPanel");
const CollapsingPanelContent = require("../CollapsingPanelContent");
const CollapsingPanelHeader = require("../CollapsingPanelHeader");

describe("TabButtons", function() {
  beforeEach(function() {
    this.instance = TestUtils.renderIntoDocument(
      <CollapsingPanel>
        <CollapsingPanelHeader>Foo</CollapsingPanelHeader>
        <CollapsingPanelContent>Bar</CollapsingPanelContent>
      </CollapsingPanel>
    );
  });

  it("should toggle state when clicking on the header", function() {
    const header = ReactDOM.findDOMNode(this.instance).querySelector(
      ".panel-cell-header"
    );

    expect(this.instance.state.isExpanded).toEqual(false);
    TestUtils.Simulate.click(header);
    expect(this.instance.state.isExpanded).toEqual(true);
    TestUtils.Simulate.click(header);
    expect(this.instance.state.isExpanded).toEqual(false);
  });

  it("should not render the content when the panel is collapsed", function() {
    const node = ReactDOM.findDOMNode(this.instance);
    const header = node.querySelector(".panel-cell-header");

    expect(node.textContent).toEqual("Foo");
    TestUtils.Simulate.click(header);
    expect(node.textContent).toEqual("FooBar");
  });
});
