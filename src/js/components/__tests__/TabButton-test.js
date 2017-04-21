jest.dontMock("../TabButton");

const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TabButton = require("../TabButton");

describe("TabButton", function() {
  beforeEach(function() {
    this.clickHandler = jasmine.createSpy("click handler");
  });

  it("should call the onClick prop with ID when clicked", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabButton label="foo" onClick={this.clickHandler} id="foo" />
    );

    // Click the TabButton's label
    TestUtils.Simulate.click(
      ReactDOM.findDOMNode(this.instance).querySelector(
        ".menu-tabbed-item-label"
      )
    );

    expect(this.clickHandler).toHaveBeenCalledWith("foo");
  });

  it("should clone nested TabButton instances with onClick and activeTab props", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabButton
        activeTab="foo"
        label="foo"
        onClick={this.clickHandler}
        id="foo"
      >
        <TabButton label="bar" id="bar" />
      </TabButton>
    );

    const nestedInstance = TestUtils.scryRenderedComponentsWithType(
      this.instance,
      TabButton
    )[0];

    expect(nestedInstance.props.activeTab).toEqual("foo");
    expect(nestedInstance.props.onClick).toEqual(this.clickHandler);
  });

  it("should call the parent onClick when clicking a nested TabButton", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabButton
        activeTab="foo"
        label="foo"
        onClick={this.clickHandler}
        id="foo"
      >
        <TabButton label="bar" id="bar" />
      </TabButton>
    );

    // Click the TabButton's label
    TestUtils.Simulate.click(
      ReactDOM.findDOMNode(this.instance).querySelector(
        ".menu-tabbed-item .menu-tabbed-item .menu-tabbed-item-label"
      )
    );

    expect(this.clickHandler).toHaveBeenCalledWith("bar");
  });
});
